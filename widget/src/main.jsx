import { createRoot } from "react-dom/client"
import Widget from "./Widget.jsx"
import "./index.css"

const container = document.createElement("div")
container.id = "healthtech-widget-root"
document.body.appendChild(container)

createRoot(container).render(<Widget />)
