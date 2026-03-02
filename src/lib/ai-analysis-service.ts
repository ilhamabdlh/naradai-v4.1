import type { DashboardContentStore, SentimentTrendItem } from "./dashboard-content-types";
import { saveDashboardContent, loadDashboardContent, generateId } from "./dashboard-content-store";
import { sendEmailNotification, generateIngestionCompletionEmailHTML } from "./email-service";

export type ProjectConfigPayload = {
  project: {
    project_id: string;
    project_name: string;
    status: "active" | "inactive";
  };
  data_sources: {
    platforms: Array<{
      name: string;
      query: {
        include_keywords: string[];
        exclude_keywords: string[];
        exact_match: boolean;
        fuzzy_match: boolean;
        synonyms: string[];
      };
    }>;
    competitors?: string[];
  };
  localization: {
    languages: string[];
  };
  content: {
    content_types: string[];
  };
  schedule: {
    start_time: string;
    end_time: string | null;
    backfill: {
      days: number;
    };
    retry_policy: {
      max_retry: number;
      retry_delay_seconds: number;
    };
  };
}

export interface TriggerIngestionResponse {
  status: string;
  message: string;
  project_id: string;
  data: {
    instanceId: string;
    dashboardContent: DashboardContentStore;
  };
  timestamp: string;
}

// Gunakan proxy di development untuk menghindari CORS
// Proxy akan mengarahkan request ke http://localhost:8000
const AI_ANALYSIS_API_URL = import.meta.env.DEV 
  ? "/api/v1/direct-analysis"
  : "http://localhost:8000/api/v1/direct-analysis";

export interface DirectAnalysisResult {
  instanceId: string;
  dashboardContent: DashboardContentStore;
}

/**
 * Aggregate sentiment trends per day
 * Groups entries by date (ignoring time) and sums positive, negative, neutral values
 */
function aggregateSentimentTrendsByDay(
  trends: SentimentTrendItem[]
): SentimentTrendItem[] {
  const grouped = new Map<string, { positive: number; negative: number; neutral: number }>();

  for (const trend of trends) {
    // Extract date only (YYYY-MM-DD) from ISO string
    const dateOnly = trend.date.split('T')[0];
    
    if (!grouped.has(dateOnly)) {
      grouped.set(dateOnly, { positive: 0, negative: 0, neutral: 0 });
    }
    
    const existing = grouped.get(dateOnly)!;
    existing.positive += trend.positive || 0;
    existing.negative += trend.negative || 0;
    existing.neutral += trend.neutral || 0;
  }

  // Convert map to array, format date as ISO with 00:00:00 time
  return Array.from(grouped.entries()).map(([date, values]) => ({
    date: `${date}T00:00:00`,
    positive: values.positive,
    negative: values.negative,
    neutral: values.neutral,
  }));
}

export async function sendDirectAnalysisRequest(
  config: ProjectConfigPayload
): Promise<DirectAnalysisResult> {
  try {
    const response = await fetch(AI_ANALYSIS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    const responseData = await response.json() as TriggerIngestionResponse;
    
    // Extract data dari response structure baru
    const instanceId = responseData.data?.instanceId || responseData.project_id;
    const newDashboardContent = responseData.data?.dashboardContent;
    
    let mergedContent: DashboardContentStore | null = null;
    
    // Populate data ke store berdasarkan instanceId dari response
    if (instanceId && newDashboardContent) {
      // Load existing data untuk instance tersebut
      const existingContent = loadDashboardContent(instanceId);
      
      // Merge data baru dengan data existing
      // Untuk array fields: append data baru ke existing (hindari duplikat berdasarkan id jika ada)
      // Untuk object fields: merge properties
      mergedContent = {
        // Merge featureVisibility (object)
        featureVisibility: {
          ...existingContent.featureVisibility,
          ...(newDashboardContent.featureVisibility || {}),
        },
        
        // Replace statsOverview dengan data baru (biasanya stat terbaru)
        statsOverview: newDashboardContent.statsOverview?.length 
          ? newDashboardContent.statsOverview 
          : existingContent.statsOverview,
        
        // Append priorityActions baru ke existing (hindari duplikat berdasarkan id)
        priorityActions: [
          ...existingContent.priorityActions,
          ...(newDashboardContent.priorityActions || []).filter(
            (newItem) => !existingContent.priorityActions.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append risks baru ke existing
        risks: [
          ...existingContent.risks,
          ...(newDashboardContent.risks || []).filter(
            (newItem) => !existingContent.risks.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append opportunities baru ke existing
        opportunities: [
          ...existingContent.opportunities,
          ...(newDashboardContent.opportunities || []).filter(
            (newItem) => !existingContent.opportunities.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append outletSatisfaction baru ke existing
        outletSatisfaction: [
          ...existingContent.outletSatisfaction,
          ...(newDashboardContent.outletSatisfaction || []).filter(
            (newItem) => !existingContent.outletSatisfaction.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append competitiveIssues baru ke existing
        competitiveIssues: [
          ...existingContent.competitiveIssues,
          ...(newDashboardContent.competitiveIssues || []).filter(
            (newItem) => !existingContent.competitiveIssues.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append competitiveKeyInsights baru ke existing
        competitiveKeyInsights: [
          ...existingContent.competitiveKeyInsights,
          ...(newDashboardContent.competitiveKeyInsights || []).filter(
            (newItem) => !existingContent.competitiveKeyInsights.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append sentiment trends baru ke existing (untuk time series data)
        // Aggregate data baru per hari sebelum merge
        whatsHappeningSentimentTrends: (() => {
          const existingTrends = existingContent.whatsHappeningSentimentTrends || [];
          const newTrends = newDashboardContent.whatsHappeningSentimentTrends || [];
          
          // Aggregate data baru per hari
          const aggregatedNewTrends = aggregateSentimentTrendsByDay(newTrends);
          
          // Combine existing dan new, lalu aggregate lagi untuk memastikan tidak ada duplikat per hari
          const allTrends = [...existingTrends, ...aggregatedNewTrends];
          return aggregateSentimentTrendsByDay(allTrends);
        })(),
        
        // Append key events baru ke existing
        whatsHappeningKeyEvents: [
          ...existingContent.whatsHappeningKeyEvents,
          ...(newDashboardContent.whatsHappeningKeyEvents || []).filter(
            (newItem) => !existingContent.whatsHappeningKeyEvents.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Merge top topics (replace dengan data terbaru jika ada)
        whatsHappeningTopTopics: newDashboardContent.whatsHappeningTopTopics?.length
          ? newDashboardContent.whatsHappeningTopTopics
          : existingContent.whatsHappeningTopTopics,
        
        // Append AI topic analysis baru ke existing
        whatsHappeningAITopicAnalysis: [
          ...existingContent.whatsHappeningAITopicAnalysis,
          ...(newDashboardContent.whatsHappeningAITopicAnalysis || []).filter(
            (newItem) => !existingContent.whatsHappeningAITopicAnalysis.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Merge topic trends data (replace dengan data terbaru)
        whatsHappeningTopicTrendsData: newDashboardContent.whatsHappeningTopicTrendsData?.length
          ? newDashboardContent.whatsHappeningTopicTrendsData
          : existingContent.whatsHappeningTopicTrendsData,
        
        // Append AI trend analysis baru ke existing
        whatsHappeningAITrendAnalysis: [
          ...existingContent.whatsHappeningAITrendAnalysis,
          ...(newDashboardContent.whatsHappeningAITrendAnalysis || []).filter(
            (newItem) => !existingContent.whatsHappeningAITrendAnalysis.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Merge word cloud (replace dengan data terbaru)
        whatsHappeningWordCloud: newDashboardContent.whatsHappeningWordCloud?.length
          ? newDashboardContent.whatsHappeningWordCloud
          : existingContent.whatsHappeningWordCloud,
        
        // Append clusters baru ke existing
        whatsHappeningClusters: [
          ...existingContent.whatsHappeningClusters,
          ...(newDashboardContent.whatsHappeningClusters || []).filter(
            (newItem) => !existingContent.whatsHappeningClusters.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append hashtags baru ke existing
        whatsHappeningHashtags: [
          ...existingContent.whatsHappeningHashtags,
          ...(newDashboardContent.whatsHappeningHashtags || []).map((item: any) => {
            // Transform data dari API ke struktur TopHashtagItem
            return {
              id: item.id || generateId(),
              tag: item.tag || '',
              conversations: item.conversations ?? undefined,
              likes: item.likes ?? 0,
              comments: item.comments ?? 0,
            };
          }).filter(
            (newItem) => !existingContent.whatsHappeningHashtags.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append accounts baru ke existing (transform data dari API ke struktur TopAccountItem)
        whatsHappeningAccounts: [
          ...existingContent.whatsHappeningAccounts,
          ...(newDashboardContent.whatsHappeningAccounts || []).map((item: any) => {
            // Helper function untuk extract nilai dari string Python dict
            const extractValueFromPythonDict = (str: string, key: string): string | null => {
              if (!str || typeof str !== 'string') return null;
              
              // Jika string dimulai dengan '{', kemungkinan adalah Python dict string
              if (!str.trim().startsWith('{')) return null;
              
              try {
                // Coba parse dengan regex untuk extract nilai dari Python dict format
                // Format: "{'key': 'value', ...}" atau "{'key': 'value'}"
                // Support untuk single quotes dan double quotes
                const patterns = [
                  // Pattern untuk single quotes: 'key': 'value'
                  new RegExp(`['"]${key}['"]\\s*:\\s*['"]([^'"]+)['"]`, 'i'),
                  // Pattern untuk escaped quotes: 'key': 'value\\nvalue'
                  new RegExp(`['"]${key}['"]\\s*:\\s*['"]([^'"]*(?:\\\\.[^'"]*)*)['"]`, 'i'),
                ];
                
                for (const pattern of patterns) {
                  const match = str.match(pattern);
                  if (match && match[1]) {
                    // Unescape common escape sequences
                    return match[1]
                      .replace(/\\n/g, ' ')
                      .replace(/\\t/g, ' ')
                      .replace(/\\'/g, "'")
                      .replace(/\\"/g, '"')
                      .replace(/\\\\/g, '\\')
                      .trim();
                  }
                }
                
                // Fallback: coba parse sebagai JSON setelah replace single quotes
                const jsonStr = str.replace(/'/g, '"').replace(/False/g, 'false').replace(/True/g, 'true');
                const parsed = JSON.parse(jsonStr);
                return parsed[key] || null;
              } catch {
                return null;
              }
            };

            // Extract name dan handle dari string Python dict jika perlu
            let accountName = item.name;
            let accountHandle = item.handle;

            // Jika name adalah string Python dict, extract nilai yang benar
            if (typeof item.name === 'string' && item.name.trim().startsWith('{')) {
              const nameValue = extractValueFromPythonDict(item.name, 'name');
              const userName = extractValueFromPythonDict(item.name, 'userName');
              accountName = nameValue || userName || 'Unknown';
            }

            // Jika handle adalah string Python dict, extract userName untuk handle
            if (typeof item.handle === 'string' && item.handle.trim().startsWith('{')) {
              const userName = extractValueFromPythonDict(item.handle, 'userName');
              accountHandle = userName ? `@${userName}` : '@unknown';
            } else if (item.handle) {
              // Pastikan handle dimulai dengan @ jika belum
              accountHandle = item.handle.startsWith('@') ? item.handle : `@${item.handle}`;
            } else {
              accountHandle = '@unknown';
            }

            // Normalize platform name
            let platform = item.platform || '';
            const platformLower = platform.toLowerCase();
            if (platformLower.includes('social media') || platformLower.includes('twitter') || platformLower.includes('x')) {
              platform = 'Twitter';
            } else if (platformLower.includes('instagram')) {
              platform = 'Instagram';
            } else if (platformLower.includes('youtube')) {
              platform = 'YouTube';
            } else if (platformLower.includes('reddit')) {
              platform = 'Reddit';
            } else if (platformLower.includes('tiktok')) {
              platform = 'TikTok';
            }

            return {
              id: item.id || generateId(),
              name: accountName || 'Unknown',
              handle: accountHandle || '@unknown',
              platform: platform || 'Social Media',
              followers: item.followers ?? undefined,
              conversations: item.conversations ?? 0,
              likes: item.likes ?? undefined,
              replies: item.replies ?? undefined,
            };
          }).filter(
            (newItem) => !existingContent.whatsHappeningAccounts.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append contents baru ke existing (transform data dari API ke struktur TopContentItem)
        whatsHappeningContents: [
          ...existingContent.whatsHappeningContents,
          ...(newDashboardContent.whatsHappeningContents || []).map((item: any) => {
            // Helper function untuk extract nilai dari string Python dict (reuse dari accounts)
            const extractValueFromPythonDict = (str: string, key: string): string | null => {
              if (!str || typeof str !== 'string') return null;
              if (!str.trim().startsWith('{')) return null;
              
              try {
                const patterns = [
                  new RegExp(`['"]${key}['"]\\s*:\\s*['"]([^'"]+)['"]`, 'i'),
                  new RegExp(`['"]${key}['"]\\s*:\\s*['"]([^'"]*(?:\\\\.[^'"]*)*)['"]`, 'i'),
                ];
                
                for (const pattern of patterns) {
                  const match = str.match(pattern);
                  if (match && match[1]) {
                    return match[1]
                      .replace(/\\n/g, ' ')
                      .replace(/\\t/g, ' ')
                      .replace(/\\'/g, "'")
                      .replace(/\\"/g, '"')
                      .replace(/\\\\/g, '\\')
                      .trim();
                  }
                }
                
                const jsonStr = str.replace(/'/g, '"').replace(/False/g, 'false').replace(/True/g, 'true');
                const parsed = JSON.parse(jsonStr);
                return parsed[key] || null;
              } catch {
                return null;
              }
            };

            // Extract author dari string Python dict jika perlu
            let authorName = item.author;
            if (typeof item.author === 'string' && item.author.trim().startsWith('{')) {
              const userName = extractValueFromPythonDict(item.author, 'userName');
              const nameValue = extractValueFromPythonDict(item.author, 'name');
              authorName = nameValue || userName || 'Unknown';
            }

            // Normalize platform name
            let platform = item.platform || '';
            const platformLower = platform.toLowerCase();
            if (platformLower === 'x' || platformLower.includes('twitter')) {
              platform = 'Twitter';
            } else if (platformLower.includes('instagram')) {
              platform = 'Instagram';
            } else if (platformLower.includes('youtube')) {
              platform = 'YouTube';
            } else if (platformLower.includes('reddit')) {
              platform = 'Reddit';
            } else if (platformLower.includes('tiktok')) {
              platform = 'TikTok';
            }

            // Jika sudah memiliki struktur TopContentItem, return as is
            if (item.id && item.title !== undefined) {
              return {
                id: item.id,
                title: item.title || item.content || "",
                platform: platform || item.platform || "",
                author: authorName || item.author || "",
                likes: item.likes ?? item.engagement ?? 0,
                comments: item.comments ?? 0,
              };
            }
            
            // Transform dari struktur API ke TopContentItem
            return {
              id: item.id || generateId(),
              title: item.content || item.title || "",
              platform: platform || "Social Media",
              author: authorName || "Unknown",
              likes: item.likes ?? item.engagement ?? 0,
              comments: item.comments ?? 0,
            };
          }).filter(
            (newItem) => !existingContent.whatsHappeningContents.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append KOL matrix baru ke existing
        whatsHappeningKOLMatrix: [
          ...existingContent.whatsHappeningKOLMatrix,
          ...(newDashboardContent.whatsHappeningKOLMatrix || []).filter(
            (newItem) => !existingContent.whatsHappeningKOLMatrix.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append AI KOL analysis baru ke existing
        whatsHappeningAIKOLAnalysis: [
          ...existingContent.whatsHappeningAIKOLAnalysis,
          ...(newDashboardContent.whatsHappeningAIKOLAnalysis || []).filter(
            (newItem) => !existingContent.whatsHappeningAIKOLAnalysis.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append share of platform baru ke existing
        whatsHappeningShareOfPlatform: [
          ...existingContent.whatsHappeningShareOfPlatform,
          ...(newDashboardContent.whatsHappeningShareOfPlatform || []),
        ],
        
        // Append competitive matrix items baru ke existing
        competitiveMatrixItems: [
          ...existingContent.competitiveMatrixItems,
          ...(newDashboardContent.competitiveMatrixItems || []).filter(
            (newItem) => !existingContent.competitiveMatrixItems.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Append competitive quadrant analysis baru ke existing
        competitiveQuadrantAnalysis: [
          ...existingContent.competitiveQuadrantAnalysis,
          ...(newDashboardContent.competitiveQuadrantAnalysis || []).filter(
            (newItem) => !existingContent.competitiveQuadrantAnalysis.some((existing) => existing.id === newItem.id)
          ),
        ],
        
        // Merge competitive sentiment scores (replace dengan data terbaru)
        competitiveSentimentScores: newDashboardContent.competitiveSentimentScores?.length
          ? newDashboardContent.competitiveSentimentScores
          : existingContent.competitiveSentimentScores,
        
        // Merge competitive volume of mentions (replace dengan data terbaru)
        competitiveVolumeOfMentions: newDashboardContent.competitiveVolumeOfMentions?.length
          ? newDashboardContent.competitiveVolumeOfMentions
          : existingContent.competitiveVolumeOfMentions,
        
        // Append competitive share of voice baru ke existing
        competitiveShareOfVoice: [
          ...existingContent.competitiveShareOfVoice,
          ...(newDashboardContent.competitiveShareOfVoice || []),
        ],
      };
      
      saveDashboardContent(mergedContent, instanceId);
      console.log(`✅ Dashboard content merged for instance: ${instanceId}`);
      console.log(`   - Stats Overview: ${mergedContent.statsOverview.length} items (${newDashboardContent.statsOverview?.length || 0} new)`);
      console.log(`   - Priority Actions: ${mergedContent.priorityActions.length} items (${newDashboardContent.priorityActions?.length || 0} new)`);
      console.log(`   - Risks: ${mergedContent.risks.length} items (${newDashboardContent.risks?.length || 0} new)`);
      console.log(`   - Opportunities: ${mergedContent.opportunities.length} items (${newDashboardContent.opportunities?.length || 0} new)`);
      console.log(`   - Sentiment Trends: ${mergedContent.whatsHappeningSentimentTrends.length} items (${newDashboardContent.whatsHappeningSentimentTrends?.length || 0} new)`);
      console.log(`   - Word Cloud: ${mergedContent.whatsHappeningWordCloud.length} items`);
      console.log(`   - Hashtags: ${mergedContent.whatsHappeningHashtags.length} items (${newDashboardContent.whatsHappeningHashtags?.length || 0} new)`);
      console.log(`   - Accounts: ${mergedContent.whatsHappeningAccounts.length} items (${newDashboardContent.whatsHappeningAccounts?.length || 0} new)`);
      console.log(`   - Contents: ${mergedContent.whatsHappeningContents.length} items (${newDashboardContent.whatsHappeningContents?.length || 0} new)`);
      
      // Kirim email notification setelah populate selesai
      try {
        const projectName = config.project.project_name || instanceId;
        const completionTime = new Date().toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        });
        
        const emailHTML = generateIngestionCompletionEmailHTML(
          projectName,
          instanceId,
          completionTime
        );
        
        await sendEmailNotification(
          ["aufaradmin@teoremaintelligence.com", "ilham@teoremaintelligence.com"],
          `Data Ingestion Completed - ${projectName}`,
          emailHTML
        );
        
        console.log("Email notification sent successfully");
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't throw error - email failure shouldn't block the main process
      }
    }
    
    // Return dalam format yang diharapkan oleh caller
    const finalInstanceId = instanceId || responseData.project_id || "";
    const finalDashboardContent: DashboardContentStore = mergedContent || newDashboardContent || loadDashboardContent(finalInstanceId);
    
    return {
      instanceId: finalInstanceId,
      dashboardContent: finalDashboardContent,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to send analysis request");
  }
}
