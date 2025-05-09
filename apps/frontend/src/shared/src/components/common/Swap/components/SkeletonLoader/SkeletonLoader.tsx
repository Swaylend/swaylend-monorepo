import {memo} from "react";
import "./SkeletonLoader.css";

interface SkeletonLoaderProps {
  isLoading: boolean;
  count?: number; // Number of items (rows) to display
  textLines?: number; // Number of text lines per item
  children?: React.ReactNode;
}

/**
 * SkeletonLoader component displays a loading skeleton when `isLoading` is true.
 * It renders a specified number of skeleton items, each containing an avatar and text lines.
 *
 * @param {boolean} isLoading - Flag to determine if the loader should be displayed.
 * @param {number} [count=3] - Number of skeleton items to display.
 * @param {number} [textLines=2] - Number of text lines in each skeleton item.
 * @param {React.ReactNode} children - The content to display when not loading.
 * @returns {JSX.Element} The skeleton loader or the children content.
 */
const SkeletonLoader = ({
  isLoading,
  count = 3,
  textLines = 2,
  children,
}: SkeletonLoaderProps) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="combined-skeleton">
      {Array.from({length: count}).map((_, index) => (
        <div key={index} className="skeleton-item">
          <div className="skeleton-avatar" />
          <div className="skeleton-text">
            {Array.from({length: textLines}).map((_, i) => (
              <div key={i} className={`skeleton-line line-${i + 1}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(SkeletonLoader);
