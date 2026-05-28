import mongoose from 'mongoose';
import dns from 'dns';

// Reliance Jio and some ISPs block SRV record lookups needed by mongodb+srv://
// Force Node's DNS client to use Google DNS instead of the system resolver.
dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');

  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
