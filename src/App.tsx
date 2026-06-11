import { Routes, Route } from "react-router-dom";
import Quiz from "./pages/Quiz";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Quiz />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  );
}
