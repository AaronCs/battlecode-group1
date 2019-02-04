interface HeapItem {
  coord: number[],
  priority: number,
}

export class PriorityQueue {
  // Taken from stackoverflow
  private comparator: (a: HeapItem, b: HeapItem) => boolean;
  private heap: HeapItem[];
  private readonly top: number = 0;

  constructor(comparator = (a: HeapItem, b: HeapItem) => a.priority > b.priority) {
    this.heap = [];
    // TODO: use the heuristic function for comparison(?)
    this.comparator = comparator;
  }

  public size(): number {
    return this.heap.length;
  }

  public insert(...values: HeapItem[]): void {
    values.forEach((value) => {
      this.heap.push(value);
      this.sortUp();
    });
  }

  public peek(): HeapItem {
    return this.heap[this.top];
  }

  public pop(): HeapItem {
    const bottom = this.size() - 1;
    if(bottom > this.top) {
      this.swap(this.top, bottom);
    }
    return this.heap[this.top];
  }

  public replace(val: HeapItem): HeapItem {
      const replacedValue = this.peek();
      this.heap[this.top] = val;
      this.sortDown();
      return replacedValue;
  }

  private greater(i: number, j: number): boolean {
    return this.comparator(this.heap[i], this.heap[j]);
  }

  private sortUp(): void {
    let node = this.size() - 1;
    while(node > this.top && this.greater(node , this.parent(node))) {
      const parent = this.parent(node);
      this.swap(node, parent);
      node = parent;
    }
  }

  private sortDown(): void {
    let node = this.top;
    while(
      (this.left(node) < this.size() && this.greater(this.left(node), node)) ||
      (this.right(node) < this.size() && this.greater(this.right(node), node))
    ) {
      const maxChild = (this.right(node) < this.size() && this.greater(this.right(node), this.left(node))) ? this.right(node) : this.left(node)
      this.swap(node, maxChild);
      node = maxChild;
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private parent: (i: number) => number = (i: number) => ((i + 1) >>> 1) - 1;
  private left: (i: number) => number = (i: number) => (i << 1) + 1;
  private right: (i: number) => number = (i: number) => (i + 1) << 1;

}