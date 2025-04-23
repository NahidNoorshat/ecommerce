import { TableRow, TableCell } from "@/components/ui/table";

export default function ProductSkeletonRow() {
  return (
    <TableRow className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}
