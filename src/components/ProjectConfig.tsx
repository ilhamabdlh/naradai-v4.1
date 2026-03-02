import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { 
  Settings, 
  Database, 
  Globe, 
  FileText, 
  Calendar,
  Plus,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { sendDirectAnalysisRequest } from "@/lib/ai-analysis-service";
import { saveScheduler } from "@/lib/scheduler-service";
import { DEFAULT_INSTANCE_ID, getInstanceById } from "@/lib/instances";

interface ProjectConfigForm {
  project: {
    project_id?: string;
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
    competitors: string[];
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

const AVAILABLE_PLATFORMS = ["x", "instagram", "news", "tiktok"];
const AVAILABLE_LANGUAGES = ["id", "en", "ms", "th", "vi"];
const CONTENT_TYPES = ["text", "image", "video"];

export function ProjectConfig() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    project: true,
    data_sources: true,
    localization: true,
    content: true,
    schedule: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectConfigForm>({
    defaultValues: {
      project: {
        project_id: undefined,
        project_name: "Brand listening",
        status: "active",
      },
      data_sources: {
        platforms: [
          {
            name: "x",
            query: {
              include_keywords: ["brandx", "produk x", "#brandx"],
              exclude_keywords: ["lowongan", "giveaway"],
              exact_match: false,
              fuzzy_match: true,
              synonyms: ["brand x", "brndx"],
            },
          },
        ],
        competitors: [],
      },
      localization: {
        languages: ["id", "en"],
      },
      content: {
        content_types: ["text", "image", "video"],
      },
      schedule: {
        start_time: new Date().toISOString().slice(0, 16),
        end_time: null,
        backfill: {
          days: 7,
        },
        retry_policy: {
          max_retry: 3,
          retry_delay_seconds: 300,
        },
      },
    },
  });

  const { fields: platformFields, append: appendPlatform, remove: removePlatform } = useFieldArray({
    control: form.control,
    name: "data_sources.platforms",
  });

  // Auto-fill project information berdasarkan instance yang dipilih
  useEffect(() => {
    const updateProjectInfo = () => {
      const currentInstanceId = localStorage.getItem("naradai_current_instance") || DEFAULT_INSTANCE_ID;
      const instance = getInstanceById(currentInstanceId);
      
      if (instance) {
        form.setValue("project.project_id", instance.id);
        form.setValue("project.project_name", instance.name);
      }
    };

    // Update saat component mount
    updateProjectInfo();

    // Listen untuk perubahan instance (storage event)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "naradai_current_instance") {
        updateProjectInfo();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Juga listen untuk custom event jika instance berubah di tab yang sama
    const handleInstanceChange = () => updateProjectInfo();
    window.addEventListener("instanceChanged", handleInstanceChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("instanceChanged", handleInstanceChange as EventListener);
    };
  }, [form]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const onSubmit = async (data: ProjectConfigForm) => {
    setIsSubmitting(true);
    
    try {
      // Format waktu untuk memastikan format sesuai API (dengan detik)
      const formatDateTime = (dateTime: string | null): string | null => {
        if (!dateTime) return null;
        // Jika format sudah lengkap dengan detik, return as is
        if (dateTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          return dateTime;
        }
        // Jika format datetime-local (tanpa detik), tambahkan :00
        if (dateTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          return `${dateTime}:00`;
        }
        return dateTime;
      };

      // Siapkan payload dengan format yang benar
      const payload = {
        ...data,
        project: {
          ...data.project,
          // Jika project_id tidak diisi, gunakan project_name sebagai project_id
          project_id: data.project.project_id || data.project.project_name,
          project_name: data.project.project_name,
          status: data.project.status,
        },
        schedule: {
          ...data.schedule,
          start_time: formatDateTime(data.schedule.start_time) || "",
          end_time: formatDateTime(data.schedule.end_time),
        },
      };
      
      console.log("Form data:", payload);
      
      const response = await sendDirectAnalysisRequest(payload as any);
      
      console.log("AI Analysis response:", response);
      
      const schedulerId = saveScheduler(data);
      console.log("Scheduler created:", schedulerId);
      
      toast.success(
        `Configuration saved! Dashboard content populated for instance: ${response.instanceId}. Email notification sent. Scheduler will run daily at ${data.schedule.start_time.split('T')[1]} for ${data.schedule.backfill.days} days.`
      );
    } catch (error) {
      console.error("Error sending analysis request:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to start analysis: ${error.message}`
          : "Failed to start analysis. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addKeyword = (platformIndex: number, type: "include" | "exclude" | "synonyms") => {
    const fieldName = type === "include" 
      ? `data_sources.platforms.${platformIndex}.query.include_keywords`
      : type === "exclude"
      ? `data_sources.platforms.${platformIndex}.query.exclude_keywords`
      : `data_sources.platforms.${platformIndex}.query.synonyms`;
    
    const current = form.getValues(fieldName as any) || [];
    form.setValue(fieldName as any, [...current, ""]);
  };

  const removeKeyword = (platformIndex: number, type: "include" | "exclude" | "synonyms", keywordIndex: number) => {
    const fieldName = type === "include" 
      ? `data_sources.platforms.${platformIndex}.query.include_keywords`
      : type === "exclude"
      ? `data_sources.platforms.${platformIndex}.query.exclude_keywords`
      : `data_sources.platforms.${platformIndex}.query.synonyms`;
    
    const current = form.getValues(fieldName as any) || [];
    current.splice(keywordIndex, 1);
    form.setValue(fieldName as any, current);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Project Configuration</h1>
              <p className="text-slate-600 mt-1">Configure your project settings and data sources</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Info Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("project")}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-slate-900">Project Information</h2>
                    <p className="text-sm text-slate-500">Basic project details</p>
                  </div>
                </div>
                {expandedSections.project ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedSections.project && (
                <div className="px-6 pb-6 space-y-4 border-t border-slate-200">
                  <FormField
                    control={form.control}
                    name="project.project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter project ID (optional, defaults to project name)" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Optional. If not provided, will use project name as project ID.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project.project_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project.status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Data Sources Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("data_sources")}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <Database className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-slate-900">Data Sources</h2>
                    <p className="text-sm text-slate-500">Configure platforms and query settings</p>
                  </div>
                </div>
                {expandedSections.data_sources ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedSections.data_sources && (
                <div className="px-6 pb-6 space-y-6 border-t border-slate-200">
                  {platformFields.map((platform, platformIndex) => (
                    <div key={platform.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <FormField
                          control={form.control}
                          name={`data_sources.platforms.${platformIndex}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Platform</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {AVAILABLE_PLATFORMS.map((platform) => (
                                    <SelectItem key={platform} value={platform}>
                                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {platformFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePlatform(platformIndex)}
                            className="ml-4 mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Include Keywords */}
                      <div className="mb-4">
                        <Label className="mb-2 block">Include Keywords</Label>
                        <div className="space-y-2">
                          {form.watch(`data_sources.platforms.${platformIndex}.query.include_keywords`).map((keyword, keywordIndex) => (
                            <div key={keywordIndex} className="flex gap-2">
                              <Input
                                value={keyword}
                                onChange={(e) => {
                                  const keywords = form.getValues(`data_sources.platforms.${platformIndex}.query.include_keywords`);
                                  keywords[keywordIndex] = e.target.value;
                                  form.setValue(`data_sources.platforms.${platformIndex}.query.include_keywords`, keywords);
                                }}
                                placeholder="Enter keyword"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeKeyword(platformIndex, "include", keywordIndex)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addKeyword(platformIndex, "include")}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Keyword
                          </Button>
                        </div>
                      </div>

                      {/* Exclude Keywords */}
                      <div className="mb-4">
                        <Label className="mb-2 block">Exclude Keywords</Label>
                        <div className="space-y-2">
                          {form.watch(`data_sources.platforms.${platformIndex}.query.exclude_keywords`).map((keyword, keywordIndex) => (
                            <div key={keywordIndex} className="flex gap-2">
                              <Input
                                value={keyword}
                                onChange={(e) => {
                                  const keywords = form.getValues(`data_sources.platforms.${platformIndex}.query.exclude_keywords`);
                                  keywords[keywordIndex] = e.target.value;
                                  form.setValue(`data_sources.platforms.${platformIndex}.query.exclude_keywords`, keywords);
                                }}
                                placeholder="Enter keyword to exclude"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeKeyword(platformIndex, "exclude", keywordIndex)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addKeyword(platformIndex, "exclude")}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Keyword
                          </Button>
                        </div>
                      </div>

                      {/* Query Options */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`data_sources.platforms.${platformIndex}.query.exact_match`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-0.5">
                                <FormLabel>Exact Match</FormLabel>
                                <FormDescription className="text-xs">Match keywords exactly</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`data_sources.platforms.${platformIndex}.query.fuzzy_match`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-0.5">
                                <FormLabel>Fuzzy Match</FormLabel>
                                <FormDescription className="text-xs">Allow approximate matches</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Synonyms */}
                      <div>
                        <Label className="mb-2 block">Synonyms</Label>
                        <div className="space-y-2">
                          {form.watch(`data_sources.platforms.${platformIndex}.query.synonyms`).map((synonym, synonymIndex) => (
                            <div key={synonymIndex} className="flex gap-2">
                              <Input
                                value={synonym}
                                onChange={(e) => {
                                  const synonyms = form.getValues(`data_sources.platforms.${platformIndex}.query.synonyms`);
                                  synonyms[synonymIndex] = e.target.value;
                                  form.setValue(`data_sources.platforms.${platformIndex}.query.synonyms`, synonyms);
                                }}
                                placeholder="Enter synonym"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeKeyword(platformIndex, "synonyms", synonymIndex)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addKeyword(platformIndex, "synonyms")}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Synonym
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <Label className="mb-2 block">Competitors</Label>
                    <FormDescription className="mb-2 text-xs">
                      Add competitor names or brands to track in competitive analysis
                    </FormDescription>
                    <div className="space-y-2">
                      {(form.watch("data_sources.competitors") ?? []).map((competitor, competitorIndex) => (
                        <div key={competitorIndex} className="flex gap-2 items-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-800 flex-1 max-w-[280px] truncate">
                            {competitor}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              const list = form.getValues("data_sources.competitors").filter((_, i) => i !== competitorIndex);
                              form.setValue("data_sources.competitors", list);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          id="new-competitor"
                          placeholder="Enter competitor name"
                          className="max-w-[280px]"
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            const value = input.value?.trim();
                            if (!value) return;
                            const list = form.getValues("data_sources.competitors");
                            if (list.includes(value)) return;
                            form.setValue("data_sources.competitors", [...list, value]);
                            input.value = "";
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById("new-competitor") as HTMLInputElement;
                            const value = input?.value?.trim();
                            if (!value) return;
                            const list = form.getValues("data_sources.competitors");
                            if (list.includes(value)) return;
                            form.setValue("data_sources.competitors", [...list, value]);
                            if (input) input.value = "";
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Competitor
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendPlatform({
                      name: "x",
                      query: {
                        include_keywords: [],
                        exclude_keywords: [],
                        exact_match: false,
                        fuzzy_match: true,
                        synonyms: [],
                      },
                    })}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Platform
                  </Button>
                </div>
              )}
            </div>

            {/* Localization Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("localization")}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-slate-900">Localization</h2>
                    <p className="text-sm text-slate-500">Select supported languages</p>
                  </div>
                </div>
                {expandedSections.localization ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedSections.localization && (
                <div className="px-6 pb-6 space-y-4 border-t border-slate-200">
                  <FormField
                    control={form.control}
                    name="localization.languages"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Languages</FormLabel>
                          <FormDescription>Select the languages to monitor</FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {AVAILABLE_LANGUAGES.map((lang) => (
                            <FormField
                              key={lang}
                              control={form.control}
                              name="localization.languages"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={lang}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(lang)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, lang])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== lang)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {lang.toUpperCase()}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Content Types Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("content")}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-slate-900">Content Types</h2>
                    <p className="text-sm text-slate-500">Select content types to monitor</p>
                  </div>
                </div>
                {expandedSections.content ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedSections.content && (
                <div className="px-6 pb-6 space-y-4 border-t border-slate-200">
                  <FormField
                    control={form.control}
                    name="content.content_types"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Content Types</FormLabel>
                          <FormDescription>Select the types of content to collect</FormDescription>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {CONTENT_TYPES.map((type) => (
                            <FormField
                              key={type}
                              control={form.control}
                              name="content.content_types"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={type}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, type])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== type)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer capitalize">
                                      {type}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Schedule Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("schedule")}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-slate-900">Schedule</h2>
                    <p className="text-sm text-slate-500">Configure collection schedule and retry policy</p>
                  </div>
                </div>
                {expandedSections.schedule ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedSections.schedule && (
                <div className="px-6 pb-6 space-y-4 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="schedule.start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schedule.end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">Leave empty for continuous collection</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="schedule.backfill.days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backfill Days</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">Number of days to backfill historical data</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="schedule.retry_policy.max_retry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Retries</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schedule.retry_policy.retry_delay_seconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retry Delay (seconds)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
