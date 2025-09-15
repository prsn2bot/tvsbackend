type AIRequest<T, R> = {
  data: T;
  resolve: (result: R) => void;
  reject: (err: any) => void;
};

const queue: AIRequest<any, any>[] = [];
let aiHandler: ((data: any) => Promise<any>) | null = null;

export function setAIHandler(handler: (data: any) => Promise<any>) {
  aiHandler = handler;
}

export function enqueueAIRequest<T, R>(data: T): Promise<R> {
  return new Promise((resolve, reject) => {
    queue.push({ data, resolve, reject });
  });
}

setInterval(async () => {
  if (!aiHandler || queue.length === 0) return;
  const { data, resolve, reject } = queue.shift()!;
  try {
    const result = await aiHandler(data);
    resolve(result);
  } catch (err) {
    reject(err);
  }
}, 1000); // 1 request per second
