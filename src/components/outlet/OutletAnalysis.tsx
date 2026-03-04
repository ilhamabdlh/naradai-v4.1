import { OutletOverview }         from "./OutletOverview";
import { OutletPriorityActions }  from "./OutletPriorityActions";
import { OutletMap }              from "./OutletMap";
import { OutletList }             from "./OutletList";
import { OutletReviewSentiment }  from "./OutletReviewSentiment";

export function OutletAnalysis() {
  return (
    <>
      <OutletOverview />
      <OutletPriorityActions />
      <OutletMap />
      <OutletList />
      <OutletReviewSentiment />
    </>
  );
}
