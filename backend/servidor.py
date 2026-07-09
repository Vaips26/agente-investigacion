from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from tavily import TavilyClient
from dotenv import load_dotenv
import os
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0.3
)

@tool
def buscar_en_internet(query: str) -> str:
    """Busca información actualizada en internet sobre un tema.
    Úsala cuando necesites datos recientes, hechos verificables, o información específica."""
    resultados = tavily.search(query=query, max_results=4, include_raw_content=False)
    texto = ""
    for i, r in enumerate(resultados["results"], 1):
        texto += f"\n[Fuente {i}] {r['title']}\n"
        texto += f"URL: {r['url']}\n"
        texto += f"Contenido: {r['content'][:400]}\n"
    return texto

herramientas = [buscar_en_internet]
llm_con_tools = llm.bind_tools(herramientas)
funciones_disponibles = {"buscar_en_internet": buscar_en_internet}

SYSTEM_PROMPT = """Eres un agente de investigación experto. Tu trabajo es responder preguntas
con información real y verificable, no con suposiciones.

Reglas:
- SIEMPRE usa la herramienta buscar_en_internet antes de responder
- Puedes hacer múltiples búsquedas si el tema lo requiere
- Al final de tu respuesta, lista las fuentes que usaste con su URL
- Responde en español de forma clara y bien estructurada
- Sé conciso pero completo"""

class Pregunta(BaseModel):
    pregunta: str

def generar_respuesta(pregunta: str):
    mensajes = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=pregunta)
    ]

    max_pasos = 6
    for paso in range(max_pasos):
        respuesta = llm_con_tools.invoke(mensajes)
        mensajes.append(respuesta)

        if not respuesta.tool_calls:
            # Streaming de la respuesta final palabra por palabra
            for palabra in respuesta.content.split(" "):
                yield f"data: {json.dumps({'tipo': 'texto', 'contenido': palabra + ' '})}\n\n"
            yield f"data: {json.dumps({'tipo': 'fin'})}\n\n"
            return

        for tool_call in respuesta.tool_calls:
            query = tool_call["args"].get("query", "")
            yield f"data: {json.dumps({'tipo': 'buscando', 'contenido': query})}\n\n"

            resultado = funciones_disponibles[tool_call["name"]].invoke(tool_call["args"])
            mensajes.append(ToolMessage(
                content=str(resultado),
                tool_call_id=tool_call["id"]
            ))

    yield f"data: {json.dumps({'tipo': 'error', 'contenido': 'No pude completar la investigación.'})}\n\n"

@app.post("/investigar")
async def investigar(payload: Pregunta):
    return StreamingResponse(
        generar_respuesta(payload.pregunta),
        media_type="text/event-stream"
    )

@app.get("/")
async def home():
    return {"status": "Agente de investigación corriendo"}