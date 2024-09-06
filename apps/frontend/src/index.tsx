import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'normalize.css';
import Providers from './providers';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <Providers>
    <App />
  </Providers>
);
