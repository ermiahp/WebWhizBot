
import { convert } from "html-to-text";
import axios from "axios";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { ChainTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

async function fetchPageContent(url) {
  const response = await axios.get(url);
  const pageContent = response.data;
  return pageContent;
}

export const getTextFromHtml = async (url) => {
  const options = {
    wordwrap: 300,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
    ],
  };

  const pageContent = await fetchPageContent(url);
  let texts = convert(pageContent, options);
  texts = texts.replace(/\n/g, " ");
  const textWithoutDoubleSpaces = texts.replace(/  +/g, " ");
  const textWithoutSpacesBeforePunctuation = textWithoutDoubleSpaces.replace(/ \./g, ".");
  const textWithoutSpacesAfterPunctuation = textWithoutSpacesBeforePunctuation.replace(/\. /g, ".");
  const textWithoutSpacesBeforeCommas = textWithoutSpacesAfterPunctuation.replace(/ ,/g, ",");
  const final = textWithoutSpacesBeforeCommas.replace(/, /g, ",");
  return final;
};

export const getSummary = async (url) => {
  const pageContent = await getTextFromHtml(url);
  const summary = await summarize(pageContent);
  return summary;
}

const summarize = async (text) => {
  const API_KEY_OPEN_AI = process.env.API_KEY_OPEN_AI;
  const model = new OpenAI({
    openAIApiKey: API_KEY_OPEN_AI,
    temperature: 0.3,
    maxTokens: -1,
    model: "gpt-4",
  });

  const vectorStore = await HNSWLib.fromTexts(
    [text],
    [{ id: 1 }],
    new OpenAIEmbeddings({
      openAIApiKey: API_KEY_OPEN_AI,
    })
  );
  const vectorStoreRetriever = vectorStore.asRetriever();
  const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
  const qaTool = new ChainTool({
    name: "Web page QA",
    description:
      "Scan a web page and answer questions about it",
    chain: chain,
  });
  const tools = [qaTool];
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
    handleParsingErrors: true,
  });
  const input = `
  Title: [Title of the Webpage]
  URL: [URL of the Webpage]
  Date Published: [Date Published]
  Date Accessed: [Date Accessed]
  
  Summary:
  Summarize the key information presented in the webpage including the main points, findings, or conclusions. Include any notable statistics or data. Ensure to keep the summary concise, clear, and informative.
  
  Images:
  Describe the images presented on the webpage, including the number of images, their content, and any captions or annotations provided. Indicate the relevance of each image to the content of the webpage.
  
  Additional Notes:
  Include any other relevant information or notable features of the webpage. Mention if there are any downloadable resources, embedded videos, or interactive elements, and describe their content and relevance to the webpage's main topics.
  
  Keywords:
  [List a few relevant keywords that represent the main topics of the webpage]
  
  ---
  
  Your summary will help in providing a quick understanding of the webpage's content without the need for viewing the entire page. Ensure to capture the essence of the information and visuals presented, making it easy for readers to grasp the main points and any accompanying visual content.
  
  `;

  const result = await executor.call({ input });
  return result.output ?? '';
}

