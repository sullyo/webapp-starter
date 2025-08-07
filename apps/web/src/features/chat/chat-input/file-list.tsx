import { AnimatePresence, motion } from "motion/react";
import { FileItem } from "./file-items";

type FileListProps = {
  files: File[];
  onFileRemove: (file: File) => void;
};

const TRANSITION = {
  type: "spring",
  duration: 0.2,
  bounce: 0,
} as const;

export function FileList({ files, onFileRemove }: FileListProps) {
  return (
    <AnimatePresence initial={false}>
      {files.length > 0 && (
        <motion.div
          animate={{ height: "auto" }}
          className="overflow-hidden"
          exit={{ height: 0 }}
          initial={{ height: 0 }}
          key="files-list"
          transition={TRANSITION}
        >
          <div className="flex flex-row overflow-x-auto pl-3">
            <AnimatePresence initial={false}>
              {files.map((file) => (
                <motion.div
                  animate={{ width: 180 }}
                  className="relative shrink-0 overflow-hidden pt-2"
                  exit={{ width: 0 }}
                  initial={{ width: 0 }}
                  key={file.name}
                  transition={TRANSITION}
                >
                  <FileItem file={file} key={file.name} onRemove={onFileRemove} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
