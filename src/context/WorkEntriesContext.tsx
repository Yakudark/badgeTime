import React, { createContext, useContext, useState } from "react";

const WorkEntriesContext = createContext({
  shouldRefresh: false,
  lastUpdate: null,
  triggerRefresh: () => {},
});

export function WorkEntriesProvider({ children }) {
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const triggerRefresh = () => {
    setShouldRefresh((prev) => !prev);
    setLastUpdate(new Date().getTime());
  };

  return (
    <WorkEntriesContext.Provider
      value={{ shouldRefresh, lastUpdate, triggerRefresh }}
    >
      {children}
    </WorkEntriesContext.Provider>
  );
}

export const useWorkEntries = () => useContext(WorkEntriesContext);
