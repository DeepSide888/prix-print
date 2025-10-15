import React from "react"
import useStore from "./utils/store.js"
import Home from "./components/Home.jsx"
import Editor from "./components/Editor.jsx"
import AssetManager from "./components/AssetManager.jsx"

export default function App() {
  const page = useStore(s => s.page) || "home"
  return (
    <>
      {page === "home" && <Home />}
      {page === "editor" && <Editor />}
      {page === "assets" && <AssetManager />}
    </>
  )
}
