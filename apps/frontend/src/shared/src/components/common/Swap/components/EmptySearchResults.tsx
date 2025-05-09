import React from "react";

interface EmptySearchResultsProps {
  value: string;
}

const EmptySearchResults = ({value}: EmptySearchResultsProps) => {
  return (
    <div
      style={{
        padding: "8px 16px",
        color: "var(--content-dimmed-light)",
      }}
    >
      {value ? (
        <span>
          No results found for{" "}
          <span style={{color: "var(--content-primary)"}}>"{value}"</span>
        </span>
      ) : null}
    </div>
  );
};

export default EmptySearchResults;
