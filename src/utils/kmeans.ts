class KMeans {
    private data: Uint8ClampedArray[];
    private k: number;
    private centroids: Uint8ClampedArray[] | null;
    private clusterAssignments: number[] | null;
  
    constructor(data: Uint8ClampedArray[], k: number) {
      this.data = data;
      this.k = k;
      this.centroids = null;
      this.clusterAssignments = null;
    }
  
    private euclideanDistance(point1: Uint8ClampedArray, point2: Uint8ClampedArray): number {
      let sum = 0;
      for (let i = 0; i < point1.length; i++) {
        sum += Math.pow(point1[i] - point2[i], 2);
      }
      return Math.sqrt(sum);
    }
  
    private findNearestCentroid(point: Uint8ClampedArray, centroids: Uint8ClampedArray[]): number {
      let minDistance = Infinity;
      let nearestCentroidIndex = 0;
  
      for (let i = 0; i < centroids.length; i++) {
        const distance = this.euclideanDistance(point, centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCentroidIndex = i;
        }
      }
  
      return nearestCentroidIndex;
    }
  
    private calculateCentroid(cluster: Uint8ClampedArray[]): Uint8ClampedArray {
      const numDimensions = cluster[0].length;
      const centroid: Uint8ClampedArray = new Uint8ClampedArray(numDimensions);
      const centroid_temp: number[] = new Array(numDimensions).fill(0);

      for(let j = 0; j < numDimensions; j++) {
        for(let i = 0; i < cluster.length; i++) {
          centroid_temp[j] += cluster[i][j];
        }
        centroid[j] = Math.floor(centroid_temp[j] / cluster.length);
      }
      return centroid;
    }
  
    public cluster(maxIterations: number = 100): void {
      const numDataPoints = this.data.length; 
      const numDimensions = this.data[0].length; // 3 for RGB
  
        // Initialize random centroids
        const randomIndices: number[] = [];
        while (randomIndices.length < this.k) {
          const randomIndex = Math.floor(Math.random() * numDataPoints);
          if (!randomIndices.includes(randomIndex)) {
            randomIndices.push(randomIndex);
          }
        }
        this.centroids = randomIndices.map((index) => Uint8ClampedArray.from(this.data[index]));
        
    // Main loop
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        // Assign each data point to the nearest centroid
        this.clusterAssignments = new Array(numDataPoints);
        for (let i = 0; i < numDataPoints; i++) {
          this.clusterAssignments[i] = this.findNearestCentroid(this.data[i], this.centroids!);
        }
  
        // Update centroids
        const newCentroids: Uint8ClampedArray[] = new Array(this.k);
        const it = this.k;
        for (let i = 0; i < it ; i++) {
          const cluster = this.data.filter((_, idx) => this.clusterAssignments![idx] === i);
          if(cluster.length === 0) {
            this.k--;
            continue;
            }

          newCentroids[i] = this.calculateCentroid(cluster);
        }
  
        // Check if centroids have changed
        let centroidsChanged = false;
        for (let i = 0; i < this.k; i++) {
          if (!this.centroids[i].every((value, idx) => value === newCentroids[i][idx])) {
            centroidsChanged = true;
            break;
          }
        }
  
        // If centroids didn't change, exit the loop early
        if (!centroidsChanged) {
          console.log(`K-means converged in ${iteration + 1} iterations.`);
          break;
        }
  
        this.centroids = newCentroids;
      }
    }
  
    public getCentroids(): Uint8ClampedArray[] | null {
      return this.centroids;
    }
  
    public getClusterAssignments(): number[] | null {
      return this.clusterAssignments;
    }
  }

export default KMeans;
  
//   // Example usage:
//   const dataMatrix: number[][] = [
//     [1, 2],
//     [3, 4],
//     [5, 6],
//     // Add more data points here
//   ];
  
//   const kmeans = new KMeans(dataMatrix, 3); // Create KMeans instance with k=3
//   kmeans.cluster(); // Perform clustering
//   const centroids = kmeans.getCentroids(); // Get cluster centroids
//   const clusterAssignments = kmeans.getClusterAssignments(); // Get cluster assignments
//   console.log("Centroids:", centroids);
//   console.log("Cluster Assignments:", clusterAssignments);
  