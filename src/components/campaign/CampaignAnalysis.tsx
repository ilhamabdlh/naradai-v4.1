import { CampaignOverview }        from "./CampaignOverview";
import { CampaignPerformance }     from "./CampaignPerformance";
import { TrendsOverTime }          from "./TrendsOverTime";
import { ChronologicalAnalysis }   from "./ChronologicalAnalysis";
import { ReplySentiment }          from "./ReplySentiment";
import { ContentAnalysis }         from "./ContentAnalysis";
import { ChannelBreakdown }        from "./ChannelBreakdown";
import { CompetitorCampaigns }     from "./CompetitorCampaigns";
import { CampaignRecommendations } from "./CampaignRecommendations";

export function CampaignAnalysis() {
  return (
    <>
      <CampaignOverview />
      <CampaignPerformance />
      <TrendsOverTime />
      <ChronologicalAnalysis />
      <ReplySentiment />
      <ContentAnalysis />
      <ChannelBreakdown />
      <CompetitorCampaigns />
      <CampaignRecommendations />
    </>
  );
}
