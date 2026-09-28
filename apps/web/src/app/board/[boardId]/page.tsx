import { BoardCanvas } from "@/features/canvas/BoardCanvas";

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  return <BoardCanvas boardId={boardId} />;
}
