import { listDatasets } from "@/lib/api-client";
import { Uploader } from "@/components/datasets/uploader";
import { DatasetList } from "@/components/datasets/dataset-list";

export default async function DatasetPage() {
  const datasets = await listDatasets();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-navy">Dataset</h1>

      <Uploader />

      <DatasetList datasets={datasets} />
    </div>
  );
}
