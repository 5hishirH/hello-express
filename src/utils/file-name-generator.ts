interface RandomStringGenerator {
  (): string;
}

export class FileNameGenerator {
  constructor(
    private readonly path?: string,
    private readonly randStrGen?: RandomStringGenerator,
  ) {
    if (path === "") {
      throw new Error("File name path cannot be an empty string");
    }
  }

  generate(meta: { fileName?: string; ext: string }): string {
    const name = meta.fileName || this.getFallbackName();
    const prefix = this.path ? `${this.path}/` : "";

    return `${prefix}${name}.${meta.ext}`;
  }

  private getFallbackName(): string {
    if (!this.randStrGen) {
      throw new Error("File name not found and no random generator provided");
    }
    return this.randStrGen();
  }
}
