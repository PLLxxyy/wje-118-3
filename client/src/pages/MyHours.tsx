import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

interface HourRecord {
  id: number;
  position_name: string;
  location_point: string;
  checkin_time: string;
  checkout_time: string;
  hours: number;
}

interface EventHours {
  event_id: number;
  event_name: string;
  event_date: string;
  event_status: string;
  total_hours: number;
  records: HourRecord[];
}

interface HoursData {
  total_hours: number;
  events: EventHours[];
}

export default function MyHours() {
  const [data, setData] = useState<HoursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    try {
      const res = await api.getMyHours();
      setData(res);
      if (res.events && res.events.length > 0) {
        setExpandedEvents(new Set(res.events.map((e: EventHours) => e.event_id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (eventId: number) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'recruiting': return '招募中';
      case 'ongoing': return '进行中';
      case 'finished': return '已结束';
      default: return status;
    }
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'recruiting': return 'badge badge-recruiting';
      case 'ongoing': return 'badge badge-ongoing';
      case 'finished': return 'badge badge-finished';
      default: return 'badge';
    }
  };

  if (loading) {
    return <div className="container page"><div className="empty-state"><p>加载中...</p></div></div>;
  }

  if (!data || data.events.length === 0) {
    return (
      <div className="container page">
        <h1 className="page-title">我的服务时长</h1>
        <div className="empty-state">
          <p>暂无服务时长记录</p>
          <span style={{ color: '#999', fontSize: 14 }}>签到并签退后，服务时长将自动统计</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1 className="page-title">我的服务时长</h1>

      <div className="grid-3 mb-24">
        <div className="stat-card">
          <div className="stat-value">{data.total_hours}</div>
          <div className="stat-label">总服务时长（小时）</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#52c41a' }}>{data.events.length}</div>
          <div className="stat-label">参与活动数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#faad14' }}>
            {data.events.reduce((sum, e) => sum + e.records.length, 0)}
          </div>
          <div className="stat-label">服务记录数</div>
        </div>
      </div>

      {data.events.map(event => {
        const isExpanded = expandedEvents.has(event.event_id);

        return (
          <div className="card" key={event.event_id} style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
            <div
              onClick={() => toggleEvent(event.event_id)}
              style={{
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: isExpanded ? '1px solid #f0f0f0' : 'none',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>
                  {event.event_name}
                </span>
                <span className={statusBadgeClass(event.event_status)}>
                  {statusLabel(event.event_status)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: '#666', fontSize: 14 }}>活动日期: {event.event_date}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1890ff' }}>
                  {event.total_hours}h
                </span>
                <span style={{ fontSize: 12, color: '#999', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
            </div>

            {isExpanded && (
              <table>
                <thead>
                  <tr>
                    <th>岗位</th>
                    <th>地点</th>
                    <th>签到时间</th>
                    <th>签退时间</th>
                    <th>服务时长</th>
                  </tr>
                </thead>
                <tbody>
                  {event.records.map(record => (
                    <tr key={record.id}>
                      <td>{record.position_name}</td>
                      <td>{record.location_point}</td>
                      <td>{record.checkin_time}</td>
                      <td>{record.checkout_time}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1890ff' }}>
                          {record.hours}h
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>
                      本活动合计
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#52c41a', fontSize: 16 }}>
                        {event.total_hours}h
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}
