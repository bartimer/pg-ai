import React from 'react';

const CustomContext = React.createContext(null);

export function useCustomContext() {
  return React.useContext(CustomContext);
}

export default CustomContext;