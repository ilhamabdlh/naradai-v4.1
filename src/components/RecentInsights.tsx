import { TrendingUp, MessageCircle, Users, LineChart, UserCheck, FileText, Hash, Contact } from "lucide-react";
import { SentimentChart } from "./SentimentChart";
import { TopicsChart } from "./TopicsChart";
import { ConversationClusters } from "./ConversationClusters";
import { WordCloud } from "./WordCloud";
import { TopicTimeSeriesChart } from "./TopicTimeSeriesChart";
import { KOLMatrixChart } from "./KOLMatrixChart";
import { TopContents } from "./TopContents";
import { TopHashtags } from "./TopHashtags";
import { TopAccounts } from "./TopAccounts";
import { ReactNode } from "react";

function Card({ id, icon: Icon, title, subtitle, children, className = "" }: { id?: string; icon: any; title: string; subtitle: string; children: ReactNode; className?: string }) {
  return (
    <div id={id} className={`rounded-2xl bg-white backdrop-blur-sm border border-slate-200 hover:border-violet-300 transition-colors overflow-hidden shadow-sm hover:shadow-lg ${className}`}>
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function RecentInsights() {
  return (
    <section id="whats-happening">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-violet-600" />
        <div>
          <h2 className="text-slate-900">What's Happening</h2>
          <p className="text-sm text-slate-600">Real-time insights from social conversations</p>
        </div>
      </div>

      {/* Row 1: Sentiment Trends - Full Width */}
        <Card id="sentiment-trends" icon={TrendingUp} title="Sentiment Trends" subtitle="Last 30 days">
          <SentimentChart />
        </Card>

        {/* Row 2: Top Discussion Topics + Topic Trends Over Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card id="top-topics" icon={MessageCircle} title="Top Discussion Topics" subtitle="By volume">
            <TopicsChart />
          </Card>
          <Card id="topic-trends" icon={LineChart} title="Topic Trends Over Time" subtitle="Daily mention volume">
            <TopicTimeSeriesChart />
          </Card>
        </div>

        {/* Row 3: Word Cloud + Conversation Clusters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card id="word-cloud" icon={MessageCircle} title="Word Cloud" subtitle="Top keywords by volume">
            <WordCloud />
          </Card>
          <Card id="conversation-clusters" icon={Users} title="Conversation Clusters" subtitle="AI-detected themes">
            <ConversationClusters />
          </Card>
        </div>

        {/* Row 4: Top Hashtags + Top Accounts + Top Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card id="top-hashtags" icon={Hash} title="Top Hashtags" subtitle="Most used hashtags">
            <TopHashtags />
          </Card>
          <Card id="top-accounts" icon={Contact} title="Top Accounts" subtitle="Most active accounts">
            <TopAccounts />
          </Card>
          <Card id="top-contents" icon={FileText} title="Top Contents" subtitle="Most engaging posts">
            <TopContents />
          </Card>
        </div>

          {/* KOL Matrix - Full Width */}
          <Card id="kol-matrix" icon={UserCheck} title="KOL Matrix" subtitle="Influence vs sentiment" className="mt-6">
            <KOLMatrixChart />
          </Card>
    </section>
  );
}
