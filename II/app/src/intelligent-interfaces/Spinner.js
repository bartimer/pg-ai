import React from "react"
import { useCustomContext } from "./CustomContext"

export function Spinner(){
   const {state} = useCustomContext()
    
   if (state.loading)
        return <div className="cover-spin">
            Loading models...
        </div>
   return <></>
    
}