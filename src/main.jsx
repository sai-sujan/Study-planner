import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Briefing from './pages/Briefing'
import Planner from './pages/Planner'
import Routine from './pages/Routine'
import Study from './pages/Study'
import PrepPlan from './pages/PrepPlan'
import History from './pages/History'
import Notes from './pages/Notes'
import Stats from './pages/Stats'
import GenAI from './pages/GenAI'
import GenAIDetail from './pages/GenAIDetail'
import BlogLibrary from './pages/BlogLibrary'
import InterviewPrep from './pages/InterviewPrep'
import DocReader from './pages/DocReader'
import DSASheet from './pages/DSASheet'
import DSAProblem from './pages/DSAProblem'
import DSAPractice from './pages/DSAPractice'
import PythonSheet from './pages/PythonSheet'
import PythonProblem from './pages/PythonProblem'
import PythonBlog from './pages/PythonBlog'
import PythonPractice from './pages/PythonPractice'
import InterviewPractice from './pages/InterviewPractice'
import InterviewHistory from './pages/InterviewHistory'
import TodayBriefing from './pages/TodayBriefing'
import WeekView from './pages/WeekView'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Briefing />} />
          <Route path="/today" element={<TodayBriefing />} />
          <Route path="/week" element={<WeekView />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/study" element={<Study />} />
          <Route path="/prep" element={<PrepPlan />} />
          <Route path="/history" element={<History />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/genai" element={<GenAI />} />
          <Route path="/genai/:sectionId" element={<GenAIDetail />} />
          <Route path="/blogs" element={<BlogLibrary />} />
          <Route path="/interview" element={<InterviewPrep />} />
          <Route path="/interview/:docId" element={<DocReader />} />
          <Route path="/practice" element={<InterviewPractice />} />
          <Route path="/practice/history" element={<InterviewHistory />} />
          <Route path="/dsa" element={<DSASheet />} />
          <Route path="/dsa/practice" element={<DSAPractice />} />
          <Route path="/dsa/:stepIdx/:topicIdx/:probIdx" element={<DSAProblem />} />
          <Route path="/python" element={<PythonSheet />} />
          <Route path="/python/blog" element={<PythonBlog />} />
          <Route path="/python/practice" element={<PythonPractice />} />
          <Route path="/python/:phaseIdx/:topicIdx/:probIdx" element={<PythonProblem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
