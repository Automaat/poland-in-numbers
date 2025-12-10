import './styles/main.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <header>
      <h1>Poland in Numbers</h1>
      <p>D3.js Data Visualization App</p>
    </header>
    <main>
      <div id="visualizations"></div>
    </main>
  `;
}
