import { useState } from "react";
import { apiFetch } from "../../api/client";

export default function VerificadorXml() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const[sif, setSif]= useState();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 20) {
      alert("Máximo 20 archivos permitidos");
      e.target.value = null; // Limpiar selección
      return;
    }
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("xmls[]", file));

    try {
      // AJUSTA ESTA URL a la de tu servidor real
      const data = await apiFetch("/xml/verificar", {
        method: "POST",
        body: formData,
      });
    
      setResults(data.resultados);
      setSif(data.sif);
    } catch (error) {
      console.error("Error verificando:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => status ? "✅" : "❌";

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ borderBottom: "2px solid #007bff", paddingBottom: "10px" }}>
        Verificador de Integridad XML (Verifactu)
      </h2>
      
      <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <input 
          type="file" 
          multiple 
          accept=".xml" 
          onChange={handleFileChange} 
          disabled={loading}
          style={{ marginBottom: "10px" }}
        />
        <br />
        <button 
          onClick={handleUpload} 
          disabled={files.length === 0 || loading}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Procesando..." : `Verificar ${files.length} facturas`}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#e9ecef" }}>
                <th style={styles.th}>Archivo / Nº</th>
                <th style={styles.th}>XML válido</th>
                <th style={styles.th}>Hash correcto</th>
                <th style={styles.th}>Cadena íntegra</th>
                <th style={styles.th}>En tu BBDD</th>
                <th style={styles.th}>Coincide Contenido</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={styles.td}>
                    <strong>{res.archivo}</strong><br />
                    <small>{res.numero}</small>
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {getStatusIcon(res.xml_valido)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {getStatusIcon(res.hashCorrecto)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {getStatusIcon(res.cadena_integra)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {getStatusIcon(res.registrado)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center", color: res.coincide_BBDD ? "green" : "red" }}>
                    {res.registrado ? (res.coincide_BBDD ? "✅ Idéntico" : "❌ Diferente") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  th: {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #dee2e6"
  },
  td: {
    padding: "12px",
    verticalAlign: "top"
  }
};