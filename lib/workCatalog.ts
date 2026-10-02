import worksData from "@/data/works.json";
import workMapsData from "@/data/work_maps.json";

export type WorkRecord = {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  reviewStatus?: string;
};

export type WorkMap = {
  workId: string;
  basis: string;
  inquiryAxes: string[];
  note?: string;
};

export const works = worksData as WorkRecord[];
export const workMaps = workMapsData as WorkMap[];

export function findWork(title: string, author?: string) {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedAuthor = (author ?? "").trim().toLowerCase();

  const record = works.find((item) => {
    const titleMatches = item.title.trim().toLowerCase() === normalizedTitle;
    if (!titleMatches) return false;
    if (!normalizedAuthor) return true;
    return (item.author ?? "").trim().toLowerCase() === normalizedAuthor;
  });

  if (!record) return null;

  return {
    ...record,
    map: workMaps.find((item) => item.workId === record.id) ?? null,
  };
}
