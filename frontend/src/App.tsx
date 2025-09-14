import { Toaster } from "sonner";
import "./App.css";
import DrawingCanvas from "./components/DrawingCanvas";

function App() {
    return (
        <>
            <Toaster position="bottom-right" />
            <DrawingCanvas />
        </>
    );
}

export default App;
