import React, { createContext, useContext, useState } from "react";

const WorkEntriesContext = createContext({
  shouldRefresh: false,
  triggerRefresh: () => {},
});

export function WorkEntriesProvider({ children }) {
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const triggerRefresh = () => {
    setShouldRefresh((prev) => !prev);
  };

  return (
    <WorkEntriesContext.Provider value={{ shouldRefresh, triggerRefresh }}>
      {children}
    </WorkEntriesContext.Provider>
  );
}

export const useWorkEntries = () => useContext(WorkEntriesContext);
