import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './pages/AppLayout'
import GroupStudentsPage from './pages/GroupStudentsPage'
import GroupsPage from './pages/GroupsPage'
import HomePage from './pages/HomePage'
import RegisterGradePage from './pages/RegisterGradePage'
import StudentGradesPage from './pages/StudentGradesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AppLayout />}>
          <Route path="/notas" element={<RegisterGradePage />} />
          <Route path="/grupos" element={<GroupsPage />} />
          <Route path="/grupos/:groupId" element={<GroupStudentsPage />} />
          <Route path="/grupos/:groupId/estudiantes/:studentId" element={<StudentGradesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
