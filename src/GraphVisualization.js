import React, { useEffect, useState, useRef } from 'react';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';
import 'vis-network/styles/vis-network.css';
import './GraphVisualization.css'

const GraphVisualization = () => {
  const graph = {
    nodes: [
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
      { id: 'D', label: 'D' },
      { id: 'E', label: 'E' },
      { id: 'F', label: 'F' },
    ],
    edges: [
      { from: 'A', to: 'B', label: '4' },
      { from: 'A', to: 'C', label: '2' },
      { from: 'B', to: 'C', label: '5' },
      { from: 'B', to: 'D', label: '10' },
      { from: 'C', to: 'D', label: '3' },
      { from: 'D', to: 'E', label: '7' },
      { from: 'E', to: 'F', label: '1' },
    ],
  };

  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [shortestPath, setShortestPath] = useState([]);
  const highlightedEdgesRef = useRef([]);
  const [displayText,setDisplayText] = useState('');

  useEffect(() => {
    // Create nodes and edges data sets
    const nodes = new DataSet(graph.nodes);
    const edges = new DataSet(graph.edges);

    // Create a data object with nodes and edges
    const data = {
      nodes,
      edges,
    };

    // Specify options for the network visualization
    const options = {
      layout: {
        randomSeed: 2,
        improvedLayout: true, // Set to false to disable physics-based layout
      },
      edges: {
        color: '#000000',
        font: {
          size: 16,
          color: '#000000',
          align: 'top'
        },
        width: 2,
      },
      physics: {
        enabled:false, // Set to true for physics-based layout
      },
      nodes: {
        shape: 'dot',
        size: 20,
        font: {
          size: 16,
          color: '#000000',
        },
        borderWidth: 1, // Set the size of all nodes
      },
    };

    // Create a network instance and attach it to the container
    const container = document.getElementById('graph-container');
    const network = new Network(container, data, options);

    // Clear previously highlighted edges
    highlightedEdgesRef.current.forEach((edgeId) => {
      edges.update({ id: edgeId, color: '#000000' }); // Reset color to default
    });

    // Highlight the shortest path edges
    shortestPath.forEach((node, index) => {
      if (index < shortestPath.length - 1) {
        const edgeId = edges.getIds({ filter: (edge) => edge.from === node && edge.to === shortestPath[index + 1] })[0];
        edges.update({ id: edgeId, color: 'red' });
        highlightedEdgesRef.current.push(edgeId);
      }
    });

    // Update and shows the text
    console.log(shortestPath)
    let resultText = ""
    shortestPath.map((node)=> {
        if (node !== shortestPath[shortestPath.length - 1]) {
            resultText = resultText + node + ", "
        }
        else {
            resultText += node
        }
    })
    setDisplayText(resultText)

    console.log(resultText)

    // Cleanup function to destroy the network when the component unmounts
    return () => {
      network.destroy();
    };
  }, [graph, shortestPath]); // เปลี่ยนเมื่อ graph และ shortestPath เปลี่ยน

  const handleStartNodeChange = (event) => {
    setStartNode(event.target.value);
  };

  const handleEndNodeChange = (event) => {
    setEndNode(event.target.value);
  };

  const handleVisualizeClick = () => {
    // Run Dijkstra's algorithm to find the shortest path
    if (startNode && endNode) {
      const shortestPathResult = findShortestPath(graph, startNode, endNode);
      setShortestPath(shortestPathResult);
    }
  };
  
  const findShortestPath = (graph, startNode, endNode) => {
    // Ensure start and end nodes are valid
    if (!startNode || !endNode || startNode === endNode) {
      return [];
    }
  
    // Placeholder implementation using Dijkstra's algorithm
    const nodes = new Set(graph.nodes.map((node) => node.id));
    const distances = {};
    const previousNodes = {};
  
    // Initialize distances with Infinity, except for the start node with distance 0
    nodes.forEach((node) => {
      distances[node] = node === startNode ? 0 : Infinity;
    });
  
    while (nodes.size > 0) {
      const currentNode = Array.from(nodes).reduce((minNode, node) => (distances[node] < distances[minNode] ? node : minNode));
      nodes.delete(currentNode);
  
      graph.edges
        .filter((edge) => edge.from === currentNode)
        .forEach((edge) => {
          const distance = distances[currentNode] + parseInt(edge.label, 10);
  
          if (distance < distances[edge.to]) {
            distances[edge.to] = distance;
            previousNodes[edge.to] = currentNode;
          }
        });
    }
  
    // Reconstruct the shortest path
    const path = [];
    let currentNode = endNode;
  
    while (previousNodes[currentNode] !== undefined) {
      path.unshift(currentNode);
      currentNode = previousNodes[currentNode];
    }
  
    // Add the starting node to the path
    path.unshift(startNode);
  
    // Highlight the shortest path edges
    const highlightedEdges = [];
    for (let i = 0; i < path.length - 1; i++) {
      const edge = graph.edges.find((e) => e.from === path[i] && e.to === path[i + 1]);
      if (edge) {
        highlightedEdges.push(edge.id);
      }
    }
  
    // Highlight the edges in the graph
    const container = document.getElementById('graph-container');
    const network = new Network(container, { nodes: graph.nodes, edges: graph.edges }, {});
    network.setSelection({ edges: highlightedEdges });
  
    return path;
  };

  return (
    <>
        <div className="title">
            <h1>RC Shortest Path</h1>
            <p>ค้นหาเส้นทางที่ดีที่สุดในการเดินทางที่ RC</p>
        </div>
        <div style={{display:'flex'}}>
            <div id="graph-container" style={{ marginLeft:"50px", height: '500px' , width: '50%' }}></div>
            <div className="option-container">
                <div className="start-container">
                    <h2>จุดเริ่มต้น : </h2>
                    <select value={startNode} onChange={handleStartNodeChange}>
                    <option value="">เลือกจุด</option>
                    {graph.nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                        {node.label}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="end-container">
                    <h2>จุดสุดท้าย :</h2>
                    <select value={endNode} onChange={handleEndNodeChange}>
                    <option value="">เลือกจุด</option>
                    {graph.nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                        {node.label}
                        </option>
                    ))}
                    </select>
                </div>
                <button className="visual-button"onClick={handleVisualizeClick}>หาเส้นทางที่เร็วที่สุด</button>
                <p className="result-text">เส้นทางที่ดีที่สุดคือ : {displayText}</p>
            </div>
        </div>
    </>
  );
};

export default GraphVisualization;