import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './pages/AppLayout'
import GroupStudentsPage from './pages/GroupStudentsPage'
import GroupsPage from './pages/GroupsPage'
import HomePage from './pages/HomePage'
import StudentGradesPage from './pages/StudentGradesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AppLayout />}>
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupStudentsPage />} />
          <Route path="/groups/:groupId/students/:studentId" element={<StudentGradesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
