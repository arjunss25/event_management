import React from 'react'
import SuperadminDashboard from './Dashboards/SuperadminDashboard'
import { Provider } from 'react-redux'
import { store } from './Redux/Store'



const App = () => {
  return (
    <Provider store={store}>
      <div>
      <SuperadminDashboard/>
      </div>
    </Provider>
  )
}

export default App