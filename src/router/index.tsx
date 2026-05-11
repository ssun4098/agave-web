import { createBrowserRouter } from 'react-router'
import App from '../App'
import Dashboard from '../pages/dashboard'
import Question from '../pages/question'
import QuestionNew from '../pages/question/new'
import LoginPage from '../pages/login/Index'
import authMiddleware from './authMiddleware'
import MyPage from '../pages/mypage/Index'
import ProblemDetail from '../pages/question/[id]'
import QuestionEdit from '../pages/question/[id]/edit'
import MyWorkbookList from '../pages/workbook/index'
import WorkbookNew from '../pages/workbook/new'
import WorkbookDetailPage from '../pages/workbook/[id]/Index'
import WorkbookEdit from '../pages/workbook/[id]/edit'
import AttemptsPage from '../pages/attempts/index'
import AttemptHistoryPage from '../pages/workbook/[id]/attempts/index'
import AttemptDetailPage from '../pages/workbook/[id]/attempts/[attemptId]'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'question', element: <Question /> },
      { path: 'question/new', element: <QuestionNew /> },
      { path: 'mypage', element: <MyPage />},
      { path: 'question/:id', element: <ProblemDetail />},
      { path: 'question/:id/edit', element: <QuestionEdit />},
      { path: 'workbook', element: <MyWorkbookList />},
      { path: 'workbook/new', element: <WorkbookNew />},
      { path: 'workbook/:id', element: <WorkbookDetailPage />},
      { path: 'workbook/:id/edit', element: <WorkbookEdit />},
      { path: 'workbook/:id/attempts', element: <AttemptHistoryPage />},
      { path: 'workbook/:id/attempts/:attemptId', element: <AttemptDetailPage />},
      { path: 'attempts', element: <AttemptsPage />},
    ],
    middleware: [authMiddleware]
  },
])

export default router
