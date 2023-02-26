import { render } from 'solid-js/web'
import UI from './components/UI'
import './style.css'

const App = () => {
    return <div id='app'>
        <UI />
    </div>
}

render(() => <App />, document.getElementById('root')!)

