import { useState } from "react";
import { apiFetch } from "../../api/client";

import Card from "../../components/common/Card"
import Button from "../../components/common/Button"

export default function VerificadorXml() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const[sif, setSif]= useState();

  const [dragging, setDragging] = useState(false)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

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

  const handleFiles = (newFiles) => {
    if (newFiles.length > 20) {
      alert("Máximo 20 archivos")
      return
    }

    setFiles(newFiles)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)

    handleFiles(droppedFiles)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }


  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Verificador de Integridad XML (Verifactu)
      </h1>
      
      {/* 📂 SUBIDA */}
      <Card>
        <h3 className="font-semibold mb-4">Subir XMLs</h3>

        <label
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition
            ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          `}
        >
          <span className="text-sm text-gray-600">
            {dragging ? "Suelta los archivos aquí" : "Haz clic o arrastra XMLs"}
          </span>

          <input
            type="file"
            multiple
            accept=".xml"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>

        {files.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            {files.length} archivo(s) seleccionados
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || loading}
          >
            {loading ? "Procesando..." : `Verificar (${files.length})`}
          </Button>
        </div>
      </Card>

      {/* 📊 RESULTADOS */}
      {results.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4">Resultados</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">

              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Archivo</th>
                  <th className="px-3 py-2 text-center">XML</th>
                  <th className="px-3 py-2 text-center">Hash</th>
                  <th className="px-3 py-2 text-center">Cadena</th>
                  <th className="px-3 py-2 text-center">Registrado</th>
                  <th className="px-3 py-2 text-center">Contenido</th>
                </tr>
              </thead>

              <tbody>
                {results.map((res, index) => (
                  <tr key={index} className="border-t">

                    <td className="px-3 py-2">
                      <div className="font-medium">{res.archivo}</div>
                      <div className="text-xs text-gray-500">
                        {res.numero}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-center">
                      {res.xml_valido ? "✅" : "❌"}
                    </td>

                    <td className="px-3 py-2 text-center">
                      {res.hashCorrecto ? "✅" : "❌"}
                    </td>

                    <td className="px-3 py-2 text-center">
                      {res.cadena_integra ? "✅" : "❌"}
                    </td>

                    <td className="px-3 py-2 text-center">
                      {res.registrado ? "✅" : "❌"}
                    </td>

                    <td className="px-3 py-2 text-center">
                      {res.registrado ? (
                        res.coincide_BBDD ? (
                          <span className="text-green-600 font-medium">
                            Idéntico
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Diferente
                          </span>
                        )
                      ) : (
                        "-"
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </Card>
      )}
    </div>
  );
}