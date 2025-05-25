// components/History.js
import React from "react";

function History({ history }) {
  return (
    <section className="history">
      <h2>Historial de Escaneos</h2>
      {history.length === 0 ? (
        <p>No hay escaneos registrados.</p>
      ) : (
        <ul>
          {history.map((entry) => (
            <li key={entry.id} className="history-item">
              <div className="history-image">
                <img src={entry.preview} alt={`Escaneado: ${entry.fileName}`} />
              </div>
              <div className="history-info">
                <p>
                  <strong>Fecha:</strong> {entry.date}
                </p>
                <p>
                  <strong>Archivo:</strong> {entry.fileName}
                </p>
                <p>
                  <strong>Resultado:</strong> {entry.result.species} ({entry.result.confidence}% de confianza)
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default History;
