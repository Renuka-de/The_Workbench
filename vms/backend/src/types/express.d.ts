declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: 'VENDOR' | 'CONTRACTOR' | 'PROJECT_MANAGER';
      };
    }
  }
}

export {};
