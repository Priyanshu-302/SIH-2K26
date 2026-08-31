import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import { classifierNode } from "./nodes/classifier.js";
import { routeQuery } from "./nodes/router.js";
import { retrieverNode } from "./nodes/retriever.js";
import { generatorNode } from "./nodes/generator.js";
import { validatorNode } from "./nodes/validator.js";

const workflow = new StateGraph(AgentState)
    .addNode("classifier", classifierNode)
    .addNode("retriever", retrieverNode)
    .addNode("generator", generatorNode)
    .addNode("validator", validatorNode)

    .addEdge(START, "classifier")

    .addConditionalEdges("classifier", routeQuery, {
        generator: "generator",
        retriever: "retriever"
    })

    .addEdge("retriever", "generator")
    .addEdge("generator", "validator")

    .addConditionalEdges("validator", (state) => {
        if (state.validationPassed) {
            return "end";
        }
        return "generator";
    }, {
        end: END,
        generator: "generator"
    });

export const graph = workflow.compile();
