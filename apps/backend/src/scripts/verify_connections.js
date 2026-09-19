import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { QdrantClient } from '@qdrant/js-client-rest';
import Redis from 'ioredis';

dotenv.config();

async function verify() {
  console.log('--- 🔍 AYUR-IP PRODUCTION CONNECTIVITY CHECK ---');

  // 1. MONGODB CHECK
  try {
    process.stdout.write('1. Testing MongoDB connection... ');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully! (Database:', mongoose.connection.name + ')');
    await mongoose.disconnect();
  } catch (err) {
    console.log('❌ MongoDB connection failed:', err.message);
  }

  // 2. QDRANT CLOUD CHECK
  try {
    process.stdout.write('2. Testing Qdrant Cloud connection... ');
    const qdrant = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });
    const collections = await qdrant.getCollections();
    console.log('✅ Qdrant Cloud connected successfully! (Collections:', collections.collections.length + ')');
  } catch (err) {
    console.log('❌ Qdrant connection failed:', err.message);
  }

  // 3. GROQ LLM CHECK
  try {
    process.stdout.write('3. Testing Groq API Key... ');
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    });
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Groq API Key valid! (Models found:', data.data.length + ')');
    } else {
      console.log('❌ Groq API Key error:', res.status, res.statusText);
    }
  } catch (err) {
    console.log('❌ Groq API Key failed:', err.message);
  }

  // 4. REDIS CHECK
  try {
    process.stdout.write('4. Testing Redis URL... ');
    if (process.env.REDIS_URL.startsWith('http')) {
      console.log('❌ REDIS_URL is using HTTPS (REST endpoint). ioredis requires a TCP URI: rediss://default:<password>@...:6379');
    } else {
      const redis = new Redis(process.env.REDIS_URL, { connectTimeout: 5000, maxRetriesPerRequest: 1 });
      await redis.set('test_key', '1', 'EX', 10);
      const val = await redis.get('test_key');
      console.log('✅ Redis connected and write/read verified successfully!');
      redis.disconnect();
    }
  } catch (err) {
    console.log('❌ Redis connection failed:', err.message);
  }

  console.log('------------------------------------------------');
}

verify();
