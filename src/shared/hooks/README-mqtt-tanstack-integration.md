# MQTT TanStack Query Integration

This document describes the implementation of TanStack Query integration for reactive MQTT state management, fulfilling requirements 2.1, 2.2, 2.3, and 2.4.

## Overview

The integration provides:
- **Reactive state management** for MQTT topics using TanStack Query
- **Automatic cache invalidation** when messages are received
- **Topic-specific data queries** with parsing support
- **Global message handling** with efficient cache updates

## Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   useMqtt Hook      │    │  Global Message      │    │  TanStack Query     │
│   (Connection)      │───▶│  Handler             │───▶│  Cache              │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
                                      │                           │
                                      ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   useMqttTopic      │◀───│  Cache Invalidation  │◀───│  React Components   │
│   Hook              │    │  & Updates           │    │  (Auto Re-render)   │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## Components

### 1. useMqttTopic Hook

The main hook for consuming MQTT topic data with TanStack Query integration.

```typescript
import { useMqttTopic } from '@/shared/hooks/use-mqtt-topic';

function MyComponent() {
  const {
    data,           // Full topic data object
    messages,       // Array of all messages
    lastMessage,    // Most recent message
    parsedData,     // Parsed data from latest message
    isConnected,    // MQTT connection status
    isSubscribed,   // Topic subscription status
    subscribe,      // Manual subscribe function
    unsubscribe,    // Manual unsubscribe function
  } = useMqttTopic('sensors/temperature', {
    parser: (payload) => JSON.parse(payload.toString()),
    qos: 1,
    maxMessages: 100,
    autoSubscribe: true,
    onParseError: (error, message) => console.error('Parse error:', error),
  });

  return (
    <div>
      <p>Temperature: {parsedData?.temperature}°C</p>
      <p>Messages received: {messages.length}</p>
    </div>
  );
}
```

### 2. MqttQueryProvider

Global provider that sets up MQTT-TanStack Query integration.

```typescript
import { MqttQueryProvider } from '@/shared/components/mqtt';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MqttQueryProvider>
        <YourAppComponents />
      </MqttQueryProvider>
    </QueryClientProvider>
  );
}
```

### 3. useMqttQueryIntegration Hook

Low-level hook for global MQTT message handling and cache management.

```typescript
import { useMqttQueryIntegration } from '@/shared/hooks/use-mqtt-query-integration';

function AdminPanel() {
  const { 
    invalidateAllTopics, 
    clearAllTopics, 
    getActiveTopics 
  } = useMqttQueryIntegration();

  return (
    <div>
      <button onClick={invalidateAllTopics}>Refresh All Topics</button>
      <button onClick={clearAllTopics}>Clear Cache</button>
      <p>Active topics: {getActiveTopics().length}</p>
    </div>
  );
}
```

## Features

### Automatic Cache Invalidation

When an MQTT message is received:
1. Global message handler processes the message
2. Updates TanStack Query cache for the specific topic
3. Invalidates the query to trigger component re-renders
4. Components automatically receive updated data

### Message Parsing

Support for custom parsing functions:
- JSON parsing for structured data
- Buffer handling for binary data
- Error handling with custom error callbacks
- Graceful fallback when parsing fails

### Connection State Integration

- Reactive connection status updates
- Automatic subscription management
- Manual subscription controls
- Subscriber counting

### Performance Optimizations

- **Infinite stale time**: MQTT data is always considered fresh
- **Selective cache updates**: Only updates caches for subscribed topics
- **Message history limits**: Configurable message retention
- **Efficient re-renders**: Only components using specific topics re-render

## Usage Patterns

### Basic Topic Subscription

```typescript
function SensorDisplay() {
  const { parsedData, isConnected } = useMqttTopic('sensors/humidity', {
    parser: (payload) => ({ humidity: parseFloat(payload.toString()) }),
  });

  if (!isConnected) return <div>Connecting...</div>;
  
  return <div>Humidity: {parsedData?.humidity}%</div>;
}
```

### Manual Subscription Control

```typescript
function AdvancedSensorDisplay() {
  const { 
    parsedData, 
    isSubscribed, 
    subscribe, 
    unsubscribe 
  } = useMqttTopic('sensors/advanced', {
    autoSubscribe: false,
    parser: JSON.parse,
  });

  return (
    <div>
      <button onClick={subscribe} disabled={isSubscribed}>
        Subscribe
      </button>
      <button onClick={unsubscribe} disabled={!isSubscribed}>
        Unsubscribe
      </button>
      {parsedData && <pre>{JSON.stringify(parsedData, null, 2)}</pre>}
    </div>
  );
}
```

### Error Handling

```typescript
function RobustSensorDisplay() {
  const { parsedData, error } = useMqttTopic('sensors/data', {
    parser: (payload) => {
      const data = JSON.parse(payload.toString());
      if (!data.temperature) throw new Error('Missing temperature');
      return data;
    },
    onParseError: (error, message) => {
      console.error('Failed to parse sensor data:', error);
      // Could send to error reporting service
    },
  });

  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Temperature: {parsedData?.temperature}°C</div>;
}
```

## Testing

The implementation includes comprehensive tests covering:
- Hook initialization and state management
- Message parsing with custom parsers
- Error handling and graceful degradation
- Buffer payload handling
- Subscription lifecycle management
- Cache invalidation behavior

Run tests with:
```bash
npm test src/shared/hooks/__tests__/use-mqtt-topic.test.ts
```

## Requirements Fulfillment

### Requirement 2.1: Connection State Management
✅ MQTT connection state is managed globally and accessible through TanStack Query

### Requirement 2.2: Topic-Specific Data Queries
✅ `useMqttTopic` hook provides reactive queries for specific MQTT topics

### Requirement 2.3: Cache Invalidation on Message Receipt
✅ Automatic cache updates and invalidation when messages are received

### Requirement 2.4: Reactive UI Updates
✅ Components automatically re-render when topic data changes

## Integration with Existing Code

The implementation integrates seamlessly with:
- Existing `useMqtt` hook for connection management
- Current TanStack Query setup and configuration
- Established error handling patterns
- TypeScript type definitions

## Next Steps

This implementation provides the foundation for:
- Publishing functionality with TanStack Query mutations (Task 8)
- Server Actions integration (Task 9)
- Connection status indicators (Task 14)
- Topic-based data components (Task 15)