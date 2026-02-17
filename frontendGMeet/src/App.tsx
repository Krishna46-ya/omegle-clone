import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Home } from './components/home'
import { Room } from './components/room'

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route element={<Home/>} path='/'></Route>
      <Route element={<Room/>} path='/room'></Route>
    </Routes>
    </BrowserRouter>
    </>

  )
}

export default App
