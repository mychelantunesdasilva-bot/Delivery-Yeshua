import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const snapshot = await getDocs(
      collection(db, "produtos")
    );

    const produtos = snapshot.docs
      .map((documento) => {
        const dados = documento.data();

        return {
          id: documento.id,
          nome: dados.nome,
          descricao: dados.descricao || "",
          preco: dados.preco,
          categoria: dados.categoria,
          ativo: dados.ativo !== false,
          esgotado: dados.esgotado === true,
          adicionais: dados.adicionais || [],
          ingredientes: dados.ingredientes || [],
          opcoesObrigatorias:
            dados.opcoesObrigatorias || [],
        };
      })
      .filter(
        (produto) =>
          produto.ativo && !produto.esgotado
      );

    return NextResponse.json({
      produtos,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar cardápio:",
      error
    );

    return NextResponse.json(
      {
        erro: "Não foi possível carregar o cardápio.",
      },
      {
        status: 500,
      }
    );
  }
}