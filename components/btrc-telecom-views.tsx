'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Signal,
  Radio,
  Server,
  Globe2,
  ShieldAlert,
  Smartphone,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  BTRC_TELEDENSITY,
  BTRC_MOBILE_SUBS,
  BTRC_INTERNET_SUBS,
  BTRC_HANDSETS,
  BTRC_TOWERS,
  BTRC_MNO_PENETRATION,
  BTRC_QOS,
  BTRC_SPECTRUM,
  BTRC_OPTICAL_FIBER,
  BTRC_VOIP,
  BTRC_METADATA,
  TelcoSubMenuId,
  TELCO_SUBMENU_ITEMS,
} from '@/lib/btrc-telecom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface BtrcViewsProps {
  activeTab: TelcoSubMenuId;
  onSelectTab: (id: TelcoSubMenuId) => void;
  setNotice: (msg: string) => void;
}

export default function BtrcTelecomViews({ activeTab, onSelectTab, setNotice }: BtrcViewsProps) {
  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Handset toggle (Local vs Import)
  const [handsetSource, setHandsetSource] = useState<'local' | 'import'>('local');

  // MNO penetration operator selection
  const [mnoOp, setMnoOp] = useState<string>('All Operators (National)');

  // QoS operator selection
  const [qosOp, setQosOp] = useState<string>('Grameenphone');

  // Generic CSV Downloader
  const downloadCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice(`Exported ${filename}.csv`);
  };

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotice(`Downloaded ${filename}.json`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Category Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '6px',
          borderBottom: '1px solid var(--border)',
          scrollbarWidth: 'thin',
        }}
      >
        {TELCO_SUBMENU_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setSearch('');
                setPage(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: active ? 600 : 500,
                background: active ? 'var(--primary)' : 'var(--card)',
                color: active ? '#fff' : 'var(--muted-foreground)',
                border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              <span>{item.title_bn}</span>
              {item.countBadge && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: active ? 'rgba(255,255,255,0.2)' : 'var(--subtle)',
                    color: active ? '#fff' : 'var(--foreground)',
                  }}
                >
                  {item.countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. TELEDENSITY VIEW */}
      {activeTab === 'teledensity' && (
        <TeledensitySection
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
        />
      )}

      {/* 2. MOBILE SUBSCRIBERS VIEW */}
      {activeTab === 'mobile-subscribers' && (
        <MobileSubscribersSection
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
        />
      )}

      {/* 3. INTERNET SUBSCRIBERS VIEW */}
      {activeTab === 'internet-subscribers' && (
        <InternetSubscribersSection
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
        />
      )}

      {/* 4. HANDSETS PRODUCTION & IMPORT VIEW */}
      {activeTab === 'handsets' && (
        <HandsetsSection
          source={handsetSource}
          setSource={setHandsetSource}
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
        />
      )}

      {/* 5. TOWERS INFRASTRUCTURE VIEW */}
      {activeTab === 'towers' && (
        <TowersSection
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
        />
      )}

      {/* 6. MNO HANDSET PENETRATION VIEW */}
      {activeTab === 'mno-penetration' && (
        <MnoPenetrationSection
          operator={mnoOp}
          setOperator={setMnoOp}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
        />
      )}

      {/* 7. QUALITY OF SERVICE (QoS) VIEW */}
      {activeTab === 'qos' && (
        <QosSection
          operator={qosOp}
          setOperator={setQosOp}
          downloadCSV={downloadCSV}
          downloadJSON={downloadJSON}
        />
      )}

      {/* 8. ALLOCATED SPECTRUM VIEW */}
      {activeTab === 'spectrum' && (
        <SpectrumSection downloadCSV={downloadCSV} downloadJSON={downloadJSON} />
      )}

      {/* 9. OPTICAL FIBER NETWORK VIEW */}
      {activeTab === 'optical-fiber' && (
        <OpticalFiberSection downloadCSV={downloadCSV} downloadJSON={downloadJSON} />
      )}

      {/* 10. ILLEGAL VOIP & SERVICE TERMINATION VIEW */}
      {activeTab === 'voip-termination' && (
        <VoipSection downloadCSV={downloadCSV} downloadJSON={downloadJSON} />
      )}
    </div>
  );
}

// =========================================================================
// 1. TELEDENSITY COMPONENT
// =========================================================================
function TeledensitySection({
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  downloadCSV,
  downloadJSON,
}: any) {
  const filtered = useMemo(() => {
    return BTRC_TELEDENSITY.filter(
      (r) =>
        r.month_bn.toLowerCase().includes(search.toLowerCase()) ||
        r.month_en.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const latest = BTRC_TELEDENSITY[0];

  const handleExportCSV = () => {
    const headers = [
      'Month (BN)',
      'Month (EN)',
      'Teledensity (%)',
      'Internet Penetration (%)',
      'Fixed Broadband (%)',
      'Mobile Internet (%)',
      'Mobile Broadband Subs (M)',
      '4G Subs (M)',
      '3G Subs (M)',
    ];
    const rows = filtered.map((r) => [
      r.month_bn,
      r.month_en,
      r.teledensity_pct,
      r.internet_penetration_pct,
      r.fixed_broadband_pct,
      r.mobile_internet_pct,
      r.mobile_broadband_subs_m,
      r.subs_4g_m,
      r.subs_3g_m,
    ]);
    downloadCSV(headers, rows, 'btrc_teledensity_penetration');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            National Teledensity
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: 'var(--primary)' }}>
            {latest?.teledensity_pct}%
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Voice & Internet combined ({latest?.month_bn})
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            Total Internet Penetration
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#6ccaff' }}>
            {latest?.internet_penetration_pct}%
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Mobile + Fixed Broadband users
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            Mobile Broadband Subs
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#f5ba67' }}>
            {latest?.mobile_broadband_subs_m}M
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            4G: {latest?.subs_4g_m}M · 3G: {latest?.subs_3g_m}M
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            Fixed Broadband Penetration
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#68d391' }}>
            {latest?.fixed_broadband_pct}%
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            ISP & PSTN Fiber connectivity
          </small>
        </div>
      </div>

      {/* Visual Chart & Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        <section className="panel data-panel" style={{ padding: '20px' }}>
          <div className="section-top" style={{ marginBottom: '14px' }}>
            <div>
              <h3>টেলিডেনসিটি ও ব্রডব্যান্ড পেনিট্রেশন অনুপাত</h3>
              <p className="metadata">National telecommunication saturation curve</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {[
              { label: 'টেলিডেনসিটি (Teledensity - Voice & Data)', val: latest?.teledensity_pct, color: 'var(--primary)' },
              { label: 'ইন্টারনেট পেনেট্রেশন (Internet Penetration Total)', val: latest?.internet_penetration_pct, color: '#6ccaff' },
              { label: 'মোবাইল ইন্টারনেট পেনেট্রেশন (Mobile Internet)', val: latest?.mobile_internet_pct, color: '#f5ba67' },
              { label: 'মোবাইল ব্রডব্যান্ড পেনেট্রেশন (Mobile Broadband 3G/4G)', val: latest?.mobile_broadband_penetration_pct, color: '#b794f4' },
              { label: 'ফিক্সড ব্রডব্যান্ড পেনেট্রেশন (Fixed Broadband ISP)', val: latest?.fixed_broadband_pct, color: '#68d391' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>{item.label}</span>
                  <strong>{item.val}%</strong>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: 'var(--subtle)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, item.val || 0)}%`, height: '100%', background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel data-panel" style={{ padding: '20px' }}>
          <div className="section-top" style={{ marginBottom: '14px' }}>
            <div>
              <h3>3G vs 4G Subscriber Migration</h3>
              <p className="metadata">Transition towards high-speed 4G / 5G data</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                <span>4G Subscriptions</span>
                <span>{latest?.subs_4g_m} Million</span>
              </div>
              <Progress value={99.1} style={{ height: '8px', marginTop: '6px' }} />
              <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
                99.1% of mobile broadband users on LTE/4G
              </small>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                <span>3G Subscriptions (Phasing out)</span>
                <span>{latest?.subs_3g_m} Million</span>
              </div>
              <Progress value={0.9} style={{ height: '8px', marginTop: '6px' }} />
              <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
                Only 0.9% legacy subscribers remaining on 3G spectrum
              </small>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--subtle)', fontSize: '11px', lineHeight: '1.6', marginTop: '10px' }}>
              <Info size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--primary)' }} />
              BTRC directive: 3G spectrum is progressively refarmed into LTE Band 1 (2100 MHz) and 5G n78 bands to maximize throughput capacity.
            </div>
          </div>
        </section>
      </div>

      {/* Historical Table */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>টেলিডেনসিটি ও ব্রডব্যান্ডের মাসিক ইতিহাস ({filtered.length} Records)</h3>
            <p className="metadata">Official BTRC historical log across all months</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--subtle)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 8px' }}>
              <Search size={14} style={{ color: 'var(--muted-foreground)', marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search month..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', padding: '6px 0' }}
              />
            </div>
            <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> Export CSV
            </button>
            <button className="quiet-button" onClick={() => downloadJSON(filtered, 'btrc_teledensity')} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> JSON
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>মাস (Month)</TableHead>
                <TableHead>টেলিডেনসিটি (ভয়েস ও ডাটা)</TableHead>
                <TableHead>ইন্টারনেট পেনেট্রেশন</TableHead>
                <TableHead>ফিক্সড ব্রডব্যান্ড</TableHead>
                <TableHead>মোবাইল ইন্টারনেট</TableHead>
                <TableHead>মোবাইল ব্রডব্যান্ড গ্রাহক (মিলিয়ন)</TableHead>
                <TableHead>৪জি গ্রাহক</TableHead>
                <TableHead>৩জি গ্রাহক</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell style={{ fontWeight: 600 }}>{r.month_bn}</TableCell>
                  <TableCell><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{r.teledensity_pct}%</span></TableCell>
                  <TableCell>{r.internet_penetration_pct}%</TableCell>
                  <TableCell>{r.fixed_broadband_pct}%</TableCell>
                  <TableCell>{r.mobile_internet_pct}%</TableCell>
                  <TableCell>{r.mobile_broadband_subs_m > 0 ? `${r.mobile_broadband_subs_m}M` : '-'}</TableCell>
                  <TableCell>{r.subs_4g_m > 0 ? `${r.subs_4g_m}M` : '-'}</TableCell>
                  <TableCell>{r.subs_3g_m > 0 ? `${r.subs_3g_m}M` : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span>Showing page {page} of {totalPages} ({filtered.length} total rows)</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 2. MOBILE SUBSCRIBERS COMPONENT
// =========================================================================
function MobileSubscribersSection({
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  downloadCSV,
  downloadJSON,
}: any) {
  const filtered = useMemo(() => {
    return BTRC_MOBILE_SUBS.filter(
      (r) =>
        r.month_bn.toLowerCase().includes(search.toLowerCase()) ||
        r.month_en.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const latest = BTRC_MOBILE_SUBS[0];

  const handleExportCSV = () => {
    const headers = ['Month (BN)', 'Month (EN)', 'Grameenphone (M)', 'Robi (M)', 'Banglalink (M)', 'Teletalk (M)', 'Total Subscribers (M)'];
    const rows = filtered.map((r) => [r.month_bn, r.month_en, r.grameenphone_m, r.robi_m, r.banglalink_m, r.teletalk_m, r.total_subs_m]);
    downloadCSV(headers, rows, 'btrc_mobile_subscribers');
  };

  const ops = [
    { name: 'গ্রামীণফোন (Grameenphone)', subs: latest?.grameenphone_m || 87.01, color: '#319dde', share: 45.69 },
    { name: 'রবি আজিয়াটা (Robi Axiata)', subs: latest?.robi_m || 58.77, color: '#ea3834', share: 30.86 },
    { name: 'বাংলালিংক (Banglalink)', subs: latest?.banglalink_m || 37.84, color: '#f68b1e', share: 19.87 },
    { name: 'টেলিটক (Teletalk)', subs: latest?.teletalk_m || 6.82, color: '#25893b', share: 3.58 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operator Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        {ops.map((op) => (
          <div key={op.name} className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{op.name.split(' ')[0]}</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${op.color}22`, color: op.color, fontWeight: 600 }}>
                {op.share}%
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 650, margin: '8px 0 4px', color: op.color }}>
              {op.subs.toFixed(2)}M
            </div>
            <small style={{ color: 'var(--muted-foreground)' }}>Active SIM subscriptions</small>
            <div style={{ height: '4px', borderRadius: '2px', background: 'var(--subtle)', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${op.share}%`, height: '100%', background: op.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Total & Market Share Visual */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '14px' }}>
          <div>
            <h3>মোট মোবাইল সিম গ্রাহক ও মার্কেট শেয়ার ডিস্ট্রিবিউশন</h3>
            <p className="metadata">Total Active SIMs: {latest?.total_subs_m} Million as of {latest?.month_bn}</p>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>
            {latest?.total_subs_m}M
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div style={{ height: '16px', borderRadius: '8px', overflow: 'hidden', display: 'flex', margin: '14px 0 20px' }}>
          {ops.map((op) => (
            <div
              key={op.name}
              title={`${op.name}: ${op.subs}M (${op.share}%)`}
              style={{ width: `${op.share}%`, background: op.color, height: '100%', transition: 'width 0.3s' }}
            />
          ))}
        </div>

        {/* Interactive Visual Infographic Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0', textAlign: 'center' }}>Market Share Donut</h4>
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer minWidth={100} minHeight={180}>
                <PieChart>
                  <Pie
                    data={ops.map((o) => ({ name: o.name.split(' ')[0], value: o.subs, color: o.color }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ops.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toFixed(2)}M SIMs`, 'Active Subs']}
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0' }}>12-Month Operator Subscriber Growth Curves (Millions)</h4>
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer minWidth={100} minHeight={180}>
                <AreaChart
                  data={BTRC_MOBILE_SUBS.slice(0, 12).reverse().map((r) => ({
                    month: r.month_en.split(' ')[0],
                    Grameenphone: r.grameenphone_m,
                    Robi: r.robi_m,
                    Banglalink: r.banglalink_m,
                    Teletalk: r.teletalk_m,
                  }))}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} unit="M" width={35} />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="Grameenphone" stroke="#319dde" fill="#319dde" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="Robi" stroke="#ea3834" fill="#ea3834" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="Banglalink" stroke="#f68b1e" fill="#f68b1e" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="Teletalk" stroke="#25893b" fill="#25893b" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Mobile Subs Table */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>মাসিক অপারেটরভিত্তিক গ্রাহক সংখ্যা ({filtered.length} Months Log)</h3>
            <p className="metadata">Complete historical series of BTRC published statistics</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--subtle)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 8px' }}>
              <Search size={14} style={{ color: 'var(--muted-foreground)', marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Filter months..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', padding: '6px 0' }}
              />
            </div>
            <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> Export CSV
            </button>
            <button className="quiet-button" onClick={() => downloadJSON(filtered, 'btrc_mobile_subscribers')} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> JSON
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>মাস (Month)</TableHead>
                <TableHead>গ্রামীণফোন (মিলিয়ন)</TableHead>
                <TableHead>রবি আজিয়াটা (মিলিয়ন)</TableHead>
                <TableHead>বাংলালিংক (মিলিয়ন)</TableHead>
                <TableHead>টেলিটক (মিলিয়ন)</TableHead>
                <TableHead>মোট গ্রাহক (মিলিয়ন)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell style={{ fontWeight: 600 }}>{r.month_bn}</TableCell>
                  <TableCell><span style={{ color: '#319dde', fontWeight: 600 }}>{r.grameenphone_m.toFixed(2)}</span></TableCell>
                  <TableCell><span style={{ color: '#ea3834', fontWeight: 600 }}>{r.robi_m.toFixed(2)}</span></TableCell>
                  <TableCell><span style={{ color: '#f68b1e', fontWeight: 600 }}>{r.banglalink_m.toFixed(2)}</span></TableCell>
                  <TableCell><span style={{ color: '#25893b', fontWeight: 600 }}>{r.teletalk_m.toFixed(2)}</span></TableCell>
                  <TableCell><strong style={{ color: 'var(--primary)' }}>{r.total_subs_m.toFixed(2)}</strong></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span>Showing page {page} of {totalPages} ({filtered.length} total rows)</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 3. INTERNET SUBSCRIBERS COMPONENT
// =========================================================================
function InternetSubscribersSection({
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  downloadCSV,
  downloadJSON,
}: any) {
  const filtered = useMemo(() => {
    return BTRC_INTERNET_SUBS.filter(
      (r) =>
        r.month_bn.toLowerCase().includes(search.toLowerCase()) ||
        r.month_en.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const latest = BTRC_INTERNET_SUBS[0];

  const handleExportCSV = () => {
    const headers = ['Month (BN)', 'Month (EN)', 'Mobile Internet (M)', 'ISP & PSTN (M)', 'Total Internet (M)'];
    const rows = filtered.map((r) => [r.month_bn, r.month_en, r.mobile_internet_m, r.isp_pstn_m, r.total_internet_m]);
    downloadCSV(headers, rows, 'btrc_internet_subscribers');
  };

  const mobilePct = ((latest?.mobile_internet_m / (latest?.total_internet_m || 1)) * 100).toFixed(1);
  const ispPct = ((latest?.isp_pstn_m / (latest?.total_internet_m || 1)) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Internet Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            Total Internet Subscribers
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: 'var(--primary)' }}>
            {latest?.total_internet_m}M
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            National Internet Base ({latest?.month_bn})
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            Mobile Internet Users
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#6ccaff' }}>
            {latest?.mobile_internet_m}M
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            {mobilePct}% of total internet subscriptions
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            ISP & PSTN Fixed Broadband
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#f5ba67' }}>
            {latest?.isp_pstn_m}M
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            {ispPct}% optical fiber and fixed lines
          </small>
        </div>
      </div>

      {/* Comparison Panel */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '14px' }}>
          <div>
            <h3>ইন্টারনেট অ্যাক্সেস মাধ্যম অনুপাত (Mobile vs Fixed Broadband)</h3>
            <p className="metadata">Dominance of mobile cellular networks in Bangladesh internet adoption</p>
          </div>
        </div>

        <div style={{ height: '14px', borderRadius: '7px', overflow: 'hidden', display: 'flex', margin: '14px 0 16px' }}>
          <div style={{ width: `${mobilePct}%`, background: '#6ccaff', height: '100%' }} />
          <div style={{ width: `${ispPct}%`, background: '#f5ba67', height: '100%' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6ccaff' }} />
            মোবাইল ইন্টারনেট: <strong>{latest?.mobile_internet_m}M</strong> ({mobilePct}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f5ba67' }} />
            আইএসপি ও পিএসটিএন: <strong>{latest?.isp_pstn_m}M</strong> ({ispPct}%)
          </span>
        </div>

        {/* Recharts Internet Subscriber Trajectory Chart */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0' }}>Internet Subscribers Growth Trajectory (Millions)</h4>
          <div style={{ width: '100%', height: '190px' }}>
            <ResponsiveContainer minWidth={100} minHeight={190}>
              <AreaChart
                data={BTRC_INTERNET_SUBS.slice(0, 12).reverse().map((r) => ({
                  month: r.month_en.split(' ')[0],
                  'Mobile Internet': r.mobile_internet_m,
                  'ISP Broadband': r.isp_pstn_m,
                  Total: r.total_internet_m,
                }))}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} unit="M" width={35} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="Mobile Internet" stroke="#6ccaff" fill="#6ccaff" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="ISP Broadband" stroke="#f5ba67" fill="#f5ba67" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Historical Internet Subs Table */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>ইন্টারনেট গ্রাহকদের ঐতিহাসিক লগ ({filtered.length} Months)</h3>
            <p className="metadata">Official BTRC published internet subscriber records</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--subtle)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 8px' }}>
              <Search size={14} style={{ color: 'var(--muted-foreground)', marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search months..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', padding: '6px 0' }}
              />
            </div>
            <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> Export CSV
            </button>
            <button className="quiet-button" onClick={() => downloadJSON(filtered, 'btrc_internet_subscribers')} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> JSON
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>মাস (Month)</TableHead>
                <TableHead>মোবাইল ইন্টারনেট (মিলিয়ন)</TableHead>
                <TableHead>আইএসপি ও পিএসটিএন (মিলিয়ন)</TableHead>
                <TableHead>সর্বমোট ইন্টারনেট গ্রাহক (মিলিয়ন)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell style={{ fontWeight: 600 }}>{r.month_bn}</TableCell>
                  <TableCell><span style={{ color: '#6ccaff', fontWeight: 600 }}>{r.mobile_internet_m.toFixed(2)}</span></TableCell>
                  <TableCell><span style={{ color: '#f5ba67', fontWeight: 600 }}>{r.isp_pstn_m.toFixed(2)}</span></TableCell>
                  <TableCell><strong style={{ color: 'var(--primary)' }}>{r.total_internet_m.toFixed(2)}</strong></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span>Showing page {page} of {totalPages} ({filtered.length} total rows)</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 4. HANDSETS PRODUCTION & IMPORTS COMPONENT
// =========================================================================
function HandsetsSection({
  source,
  setSource,
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  downloadCSV,
  downloadJSON,
}: any) {
  const localList = BTRC_HANDSETS.local_manufacturing;
  const importList = BTRC_HANDSETS.imports;
  const activeList: any[] = source === 'local' ? localList : importList;

  const filtered = useMemo(() => {
    return activeList.filter(
      (r: any) =>
        r.month_bn.toLowerCase().includes(search.toLowerCase()) ||
        r.month_en.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeList, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const latest: any = activeList[0];

  const handleExportCSV = () => {
    if (source === 'local') {
      const headers = ['Month (BN)', 'Month (EN)', '2G (Lakh)', '3G (Lakh)', '4G (Lakh)', '5G (Lakh)', 'Total (Lakh)', 'Feature Phone (%)', 'Smartphone (%)'];
      const rows = filtered.map((r: any) => [r.month_bn, r.month_en, r.tech_2g_lakh, r.tech_3g_lakh, r.tech_4g_lakh, r.tech_5g_lakh, r.total_lakh, r.feature_phone_pct, r.smartphone_pct]);
      downloadCSV(headers, rows, 'btrc_local_handset_manufacturing');
    } else {
      const headers = ['Month (BN)', 'Month (EN)', '2G (Units)', '3G (Units)', '4G (Units)', '5G (Units)', 'Total (Units)', 'Feature Phone (%)', 'Smartphone (%)'];
      const rows = filtered.map((r: any) => [r.month_bn, r.month_en, r.tech_2g_units, r.tech_3g_units, r.tech_4g_units, r.tech_5g_units, r.total_units, r.feature_phone_pct, r.smartphone_pct]);
      downloadCSV(headers, rows, 'btrc_imported_handsets');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Selector between Local Manufacturing and Imports */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={() => {
            setSource('local');
            setPage(1);
          }}
          className="quiet-button"
          style={{
            background: source === 'local' ? 'var(--primary)' : 'var(--card)',
            color: source === 'local' ? '#fff' : 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <Smartphone size={14} /> স্থানীয় উৎপাদন (Local Manufacturing - লক্ষ)
        </button>
        <button
          onClick={() => {
            setSource('import');
            setPage(1);
          }}
          className="quiet-button"
          style={{
            background: source === 'import' ? 'var(--primary)' : 'var(--card)',
            color: source === 'import' ? '#fff' : 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <Download size={14} /> আমদানি (Imports - সংখ্যায়)
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            {source === 'local' ? 'সর্বমোট স্থানীয় উৎপাদন' : 'সর্বমোট আমদানি'}
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: 'var(--primary)' }}>
            {source === 'local' ? `${latest?.total_lakh} লক্ষ` : `${latest?.total_units?.toLocaleString()} টি`}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Latest monthly volume ({latest?.month_bn})
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            ৪জি হ্যান্ডসেট
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#6ccaff' }}>
            {source === 'local' ? `${latest?.tech_4g_lakh} লক্ষ` : `${latest?.tech_4g_units?.toLocaleString()} টি`}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            High speed 4G enabled devices
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            ৫জি হ্যান্ডসেট
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#f5ba67' }}>
            {source === 'local' ? `${latest?.tech_5g_lakh} লক্ষ` : `${latest?.tech_5g_units?.toLocaleString()} টি`}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Next-gen 5G device ramp-up
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            স্মার্টফোন অনুপাত
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#68d391' }}>
            {latest?.smartphone_pct}%
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            ফিচার ফোন: {latest?.feature_phone_pct}%
          </small>
        </div>
      </div>

      {/* Table Section */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>
              {source === 'local' ? 'স্থানীয় মোবাইল ফোন উৎপাদনের পরিসংখ্যান (৫৫ মাস)' : 'আমদানিকৃত মোবাইল ফোনের পরিসংখ্যান (৫৫ মাস)'}
            </h3>
            <p className="metadata">Technology distribution across 2G, 3G, 4G, 5G handset units</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--subtle)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 8px' }}>
              <Search size={14} style={{ color: 'var(--muted-foreground)', marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search month..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', padding: '6px 0' }}
              />
            </div>
            <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> Export CSV
            </button>
            <button className="quiet-button" onClick={() => downloadJSON(filtered, source === 'local' ? 'btrc_handsets_local' : 'btrc_handsets_import')} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> JSON
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>মাস (Month)</TableHead>
                <TableHead>২জি {source === 'local' ? '(লক্ষ)' : '(টি)'}</TableHead>
                <TableHead>৩জি {source === 'local' ? '(লক্ষ)' : '(টি)'}</TableHead>
                <TableHead>৪জি {source === 'local' ? '(লক্ষ)' : '(টি)'}</TableHead>
                <TableHead>৫জি {source === 'local' ? '(লক্ষ)' : '(টি)'}</TableHead>
                <TableHead>সর্বমোট {source === 'local' ? '(লক্ষ)' : '(টি)'}</TableHead>
                <TableHead>ফিচার ফোন (%)</TableHead>
                <TableHead>স্মার্ট ফোন (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((r: any, i: number) => (
                <TableRow key={i}>
                  <TableCell style={{ fontWeight: 600 }}>{r.month_bn}</TableCell>
                  <TableCell>{source === 'local' ? r.tech_2g_lakh : r.tech_2g_units?.toLocaleString()}</TableCell>
                  <TableCell>{source === 'local' ? (r.tech_3g_lakh > 0 ? r.tech_3g_lakh : '-') : r.tech_3g_units?.toLocaleString()}</TableCell>
                  <TableCell><span style={{ color: '#6ccaff', fontWeight: 600 }}>{source === 'local' ? r.tech_4g_lakh : r.tech_4g_units?.toLocaleString()}</span></TableCell>
                  <TableCell><span style={{ color: '#f5ba67', fontWeight: 600 }}>{source === 'local' ? r.tech_5g_lakh : r.tech_5g_units?.toLocaleString()}</span></TableCell>
                  <TableCell><strong style={{ color: 'var(--primary)' }}>{source === 'local' ? r.total_lakh : r.total_units?.toLocaleString()}</strong></TableCell>
                  <TableCell>{r.feature_phone_pct}%</TableCell>
                  <TableCell><span style={{ color: '#68d391', fontWeight: 600 }}>{r.smartphone_pct}%</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span>Showing page {page} of {totalPages} ({filtered.length} total rows)</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 5. TOWERS INFRASTRUCTURE COMPONENT
// =========================================================================
function TowersSection({
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  downloadCSV,
  downloadJSON,
}: any) {
  const filtered = useMemo(() => {
    return BTRC_TOWERS.filter((r) => r.month.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const latest = BTRC_TOWERS[0];

  const totalTowerCos = (latest?.edotco || 0) + (latest?.summit || 0) + (latest?.kirtonkhola || 0) + (latest?.frontier || 0);
  const totalMnos = (latest?.gp || 0) + (latest?.robi || 0) + (latest?.banglalink || 0) + (latest?.teletalk || 0);
  const towerCoPct = ((totalTowerCos / (latest?.total_towers || 1)) * 100).toFixed(1);
  const mnoPct = ((totalMnos / (latest?.total_towers || 1)) * 100).toFixed(1);

  const handleExportCSV = () => {
    const headers = ['Month', 'GP', 'Robi', 'Banglalink', 'Teletalk', 'edotco', 'Summit', 'Kirtonkhola', 'Frontier', 'BTCL', 'Total Towers'];
    const rows = filtered.map((r) => [r.month, r.gp, r.robi, r.banglalink, r.teletalk, r.edotco, r.summit, r.kirtonkhola, r.frontier, r.btcl, r.total_towers]);
    downloadCSV(headers, rows, 'btrc_towers_infrastructure');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Tower Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            সর্বমোট মোবাইল টাওয়ার (National Towers)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: 'var(--primary)' }}>
            {latest?.total_towers?.toLocaleString()}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Across all 64 districts ({latest?.month})
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            TowerCos (টাওয়ার শেয়ারিং প্রতিষ্ঠান)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#6ccaff' }}>
            {totalTowerCos.toLocaleString()}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            {towerCoPct}% shared tower infrastructure
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            MNOs (অপারেটর নিজস্ব টাওয়ার)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#f5ba67' }}>
            {totalMnos.toLocaleString()}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            {mnoPct}% operator owned towers
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            শীর্ষ টাওয়ার কোম্পানি (edotco)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#68d391' }}>
            {latest?.edotco?.toLocaleString()}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Summit: {latest?.summit?.toLocaleString()} · Kirtonkhola: {latest?.kirtonkhola?.toLocaleString()}
          </small>
        </div>
      </div>

      {/* Tower Ownership Breakdown */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '14px' }}>
          <div>
            <h3>টাওয়ার মালিকানা ও শেয়ারিং বিন্যাস (TowerCo vs MNO Breakdown)</h3>
            <p className="metadata">Transition towards centralized Tower Sharing Operators per BTRC Tower Sharing Guideline</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#6ccaff' }}>
              Tower Sharing Operators (TowerCos): {totalTowerCos.toLocaleString()} ({towerCoPct}%)
            </div>
            {[
              { name: 'edotco Bangladesh Co. Ltd', count: latest?.edotco || 0, color: '#6ccaff' },
              { name: 'Summit Towers Limited', count: latest?.summit || 0, color: '#48a989' },
              { name: 'Kirtonkhola Tower Technologies', count: latest?.kirtonkhola || 0, color: '#9f7aea' },
              { name: 'Frontier Towers Bangladesh (AB)', count: latest?.frontier || 0, color: '#ed8936' },
            ].map((tc) => (
              <div key={tc.name} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{tc.name}</span>
                  <strong>{tc.count.toLocaleString()}</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--subtle)', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(tc.count / (latest?.total_towers || 1)) * 100}%`, height: '100%', background: tc.color }} />
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#f5ba67' }}>
              Mobile Network Operators (MNOs): {totalMnos.toLocaleString()} ({mnoPct}%)
            </div>
            {[
              { name: 'Grameenphone Limited', count: latest?.gp || 0, color: '#319dde' },
              { name: 'Banglalink Digital Communications', count: latest?.banglalink || 0, color: '#f68b1e' },
              { name: 'Teletalk Bangladesh Limited', count: latest?.teletalk || 0, color: '#25893b' },
              { name: 'Robi Axiata Limited', count: latest?.robi || 0, color: '#ea3834' },
              { name: 'BTCL (Government Telecommunications)', count: latest?.btcl || 0, color: '#718096' },
            ].map((mno) => (
              <div key={mno.name} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{mno.name}</span>
                  <strong>{mno.count.toLocaleString()}</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--subtle)', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(mno.count / (latest?.total_towers || 1)) * 100}%`, height: '100%', background: mno.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tower Historical Table */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>মাসিক টাওয়ার সংখ্যা ঐতিহাসিক লগ ({filtered.length} Months)</h3>
            <p className="metadata">Full chronological distribution from official BTRC static page</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--subtle)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0 8px' }}>
              <Search size={14} style={{ color: 'var(--muted-foreground)', marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search month..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', padding: '6px 0' }}
              />
            </div>
            <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> Export CSV
            </button>
            <button className="quiet-button" onClick={() => downloadJSON(filtered, 'btrc_towers')} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
              <Download size={13} /> JSON
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>GP</TableHead>
                <TableHead>Robi</TableHead>
                <TableHead>Banglalink</TableHead>
                <TableHead>Teletalk</TableHead>
                <TableHead>edotco</TableHead>
                <TableHead>Summit</TableHead>
                <TableHead>Kirtonkhola</TableHead>
                <TableHead>Frontier</TableHead>
                <TableHead>BTCL</TableHead>
                <TableHead>Total Towers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell style={{ fontWeight: 600 }}>{r.month}</TableCell>
                  <TableCell>{r.gp.toLocaleString()}</TableCell>
                  <TableCell>{r.robi.toLocaleString()}</TableCell>
                  <TableCell>{r.banglalink.toLocaleString()}</TableCell>
                  <TableCell>{r.teletalk.toLocaleString()}</TableCell>
                  <TableCell><span style={{ color: '#6ccaff', fontWeight: 600 }}>{r.edotco.toLocaleString()}</span></TableCell>
                  <TableCell><span style={{ color: '#48a989', fontWeight: 600 }}>{r.summit.toLocaleString()}</span></TableCell>
                  <TableCell>{r.kirtonkhola.toLocaleString()}</TableCell>
                  <TableCell>{r.frontier.toLocaleString()}</TableCell>
                  <TableCell>{r.btcl.toLocaleString()}</TableCell>
                  <TableCell><strong style={{ color: 'var(--primary)' }}>{r.total_towers.toLocaleString()}</strong></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span>Showing page {page} of {totalPages} ({filtered.length} total rows)</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="quiet-button" style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 6. MNO NETWORK HANDSET PENETRATION COMPONENT
// =========================================================================
function MnoPenetrationSection({ operator, setOperator, downloadCSV, downloadJSON }: any) {
  const operators = Object.keys(BTRC_MNO_PENETRATION);
  const activeData = BTRC_MNO_PENETRATION[operator] || [];
  const latest = activeData[0];

  const handleExportCSV = () => {
    const headers = [
      'Month',
      '2G Devices',
      '3G Devices',
      '4G Devices',
      '5G Devices',
      'Total Mobile Phones (Million)',
      '700 MHz Supported',
      '2.3 & 2.6 GHz Supported',
      'Feature Phone (%)',
      'Smartphone (%)',
      '5G Phone (%)',
    ];
    const rows = activeData.map((r: any) => [
      r.month,
      r.tech_2g,
      r.tech_3g,
      r.tech_4g,
      r.tech_5g,
      r.total_million,
      r.band_700mhz_supported,
      r.band_2_3_and_2_6ghz_supported,
      r.feature_phone_pct,
      r.smartphone_pct,
      r.five_g_pct,
    ]);
    downloadCSV(headers, rows, `btrc_mno_penetration_${operator.replace(/\s+/g, '_')}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operator Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {operators.map((op) => (
            <button
              key={op}
              onClick={() => setOperator(op)}
              className="quiet-button"
              style={{
                background: operator === op ? 'var(--primary)' : 'var(--card)',
                color: operator === op ? '#fff' : 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: operator === op ? 600 : 500,
              }}
            >
              {op}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href="https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-btrc/2026/7/ae7f3884-f02c-4db9-820d-f11a9b284ba1.pdf"
            target="_blank"
            rel="noreferrer"
            className="quiet-button"
            style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)' }}
          >
            <ExternalLink size={13} /> Official BTRC Audit PDF
          </a>
          <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            Total Mobile Phones on Network
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: 'var(--primary)' }}>
            {latest?.total_million}M
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            {latest?.month} (BTRC Reconciled Audit)
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            Smartphone Penetration
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#6ccaff' }}>
            {latest?.smartphone_pct}%
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Feature Phone: {latest?.feature_phone_pct}%
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            5G Enabled Handsets
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#f5ba67' }}>
            {latest?.tech_5g?.toLocaleString()}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            {latest?.five_g_pct}% of devices on network
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            700 MHz & 2.6 GHz Readiness
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#68d391' }}>
            {(latest?.band_2_3_and_2_6ghz_supported / 1000000).toFixed(1)}M
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            700 MHz Supported: {(latest?.band_700mhz_supported / 1000000).toFixed(1)}M
          </small>
        </div>
      </div>

      {/* Detailed Table */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '14px' }}>
          <div>
            <h3>{operator} — হ্যান্ডসেট টেকনোলজি ও ফ্রিকোয়েন্সি সাপোর্ট পরিসংখ্যান</h3>
            <p className="metadata">Audit verified by BTRC Engineering & Operations Division</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>2G Devices</TableHead>
                <TableHead>3G Devices</TableHead>
                <TableHead>4G Devices</TableHead>
                <TableHead>5G Devices</TableHead>
                <TableHead>Total (Million)</TableHead>
                <TableHead>700 MHz Support</TableHead>
                <TableHead>2.3 & 2.6 GHz Support</TableHead>
                <TableHead>Feature Phone %</TableHead>
                <TableHead>Smartphone %</TableHead>
                <TableHead>5G %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeData.map((r: any, i: number) => (
                <TableRow key={i}>
                  <TableCell style={{ fontWeight: 600 }}>{r.month}</TableCell>
                  <TableCell>{r.tech_2g?.toLocaleString()}</TableCell>
                  <TableCell>{r.tech_3g?.toLocaleString()}</TableCell>
                  <TableCell><span style={{ color: '#6ccaff', fontWeight: 600 }}>{r.tech_4g?.toLocaleString()}</span></TableCell>
                  <TableCell><span style={{ color: '#f5ba67', fontWeight: 600 }}>{r.tech_5g?.toLocaleString()}</span></TableCell>
                  <TableCell><strong style={{ color: 'var(--primary)' }}>{r.total_million}M</strong></TableCell>
                  <TableCell>{r.band_700mhz_supported?.toLocaleString()}</TableCell>
                  <TableCell>{r.band_2_3_and_2_6ghz_supported?.toLocaleString()}</TableCell>
                  <TableCell>{r.feature_phone_pct}%</TableCell>
                  <TableCell><span style={{ color: '#68d391', fontWeight: 600 }}>{r.smartphone_pct}%</span></TableCell>
                  <TableCell>{r.five_g_pct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 7. QUALITY OF SERVICE (QoS) COMPONENT
// =========================================================================
function QosSection({ operator, setOperator, downloadCSV, downloadJSON }: any) {
  const operators = Object.keys(BTRC_QOS);
  const activeReport = BTRC_QOS[operator] || { source_pdf: '', period: 'July 2026', kpis: [] };

  const handleExportCSV = () => {
    const headers = ['Operator', 'Period', 'KPI Name', 'BTRC Threshold', 'BTRC Monitored Value', 'Operator Declared Value'];
    const rows = activeReport.kpis.map((k: any) => [operator, activeReport.period, k.kpi, k.threshold, k.btrc_monitored ?? 'N/A', k.operator_declared ?? 'N/A']);
    downloadCSV(headers, rows, `btrc_qos_${operator.replace(/\s+/g, '_')}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Operator Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {operators.map((op) => (
            <button
              key={op}
              onClick={() => setOperator(op)}
              className="quiet-button"
              style={{
                background: operator === op ? 'var(--primary)' : 'var(--card)',
                color: operator === op ? '#fff' : 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: operator === op ? 600 : 500,
              }}
            >
              {op}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeReport.source_pdf && (
            <a
              href={activeReport.source_pdf}
              target="_blank"
              rel="noreferrer"
              className="quiet-button"
              style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)' }}
            >
              <ExternalLink size={13} /> View Official BTRC QoS Report (PDF)
            </a>
          )}
          <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* QoS Preamble Banner */}
      <div style={{ padding: '14px 18px', borderRadius: '8px', background: 'var(--subtle)', border: '1px solid var(--border)', fontSize: '12px', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontWeight: 600, color: 'var(--primary)' }}>
          <CheckCircle2 size={16} /> BTRC Independent Review & Reconciled Quality of Service Framework (July 2026)
        </div>
        <span style={{ color: 'var(--muted-foreground)' }}>
          Prepared in accordance with Table 1 of the “Directives on Quality of Services (QoS)” and measured via national drive-tests and direct core counter monitoring by BTRC engineering divisions.
        </span>
      </div>

      {/* KPI Table */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '16px' }}>
          <div>
            <h3>{operator} — Key Performance Indicators (National Level)</h3>
            <p className="metadata">Comparison between BTRC Monitored vs Operator Declared telemetry</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI Parameter</TableHead>
                <TableHead>BTRC Threshold</TableHead>
                <TableHead>BTRC Monitored Value</TableHead>
                <TableHead>Operator Declared Value</TableHead>
                <TableHead>Compliance Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeReport.kpis.map((k: any, i: number) => {
                let compliant = true;
                if (k.threshold.includes('<=') && k.btrc_monitored !== null) {
                  const thresh = parseFloat(k.threshold.replace('<=', '').trim());
                  compliant = k.btrc_monitored <= thresh;
                } else if (k.threshold.includes('>=') && k.btrc_monitored !== null) {
                  const thresh = parseFloat(k.threshold.replace('>=', '').trim());
                  compliant = k.btrc_monitored >= thresh;
                }

                return (
                  <TableRow key={i}>
                    <TableCell style={{ fontWeight: 600 }}>{k.kpi}</TableCell>
                    <TableCell><code style={{ background: 'var(--subtle)', padding: '2px 6px', borderRadius: '4px' }}>{k.threshold}</code></TableCell>
                    <TableCell><strong style={{ color: compliant ? 'var(--primary)' : '#e53e3e' }}>{k.btrc_monitored !== null ? k.btrc_monitored : 'N/A'}</strong></TableCell>
                    <TableCell>{k.operator_declared !== null ? k.operator_declared : 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: compliant ? '#48a98922' : '#e53e3e22',
                          color: compliant ? '#48a989' : '#e53e3e',
                        }}
                      >
                        {compliant ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {compliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 8. ALLOCATED SPECTRUM COMPONENT
// =========================================================================
function SpectrumSection({ downloadCSV, downloadJSON }: any) {
  const spectrum = BTRC_SPECTRUM;

  const handleExportCSV = () => {
    const headers = ['Operator', '700 MHz (MHz)', '900 MHz (MHz)', '1800 MHz (MHz)', '2100 MHz (MHz)', '2.3 GHz (MHz)', '2.6 GHz (MHz)', 'Total Allocated (MHz)', 'Share (%)'];
    const rows = spectrum.operators.map((op) => [
      op.operator,
      op.band_700mhz,
      op.band_900mhz,
      op.band_1800mhz,
      op.band_2100mhz,
      op.band_2_3ghz,
      op.band_2_6ghz,
      op.total_mhz,
      op.share_pct,
    ]);
    downloadCSV(headers, rows, 'btrc_spectrum_allocated');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Spectrum Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            সর্বমোট বরাদ্দকৃত তরঙ্গ (Total Spectrum)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: 'var(--primary)' }}>
            {spectrum.band_totals.total_mhz} MHz
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Allocated across 4 mobile network operators
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            গ্রামীণফোন (Grameenphone)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#319dde' }}>
            117.4 MHz
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            28.87% of national access spectrum
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            রবি আজিয়াটা (Robi Axiata)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#ea3834' }}>
            104.0 MHz
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            25.58% of national access spectrum
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            বাংলালিংক ও টেলিটক
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#f68b1e' }}>
            145.2 MHz
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Banglalink: 80.0 MHz · Teletalk: 65.2 MHz
          </small>
        </div>
      </div>

      {/* Spectrum Band Visual Stack */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '14px' }}>
          <div>
            <h3>অপারেটরভিত্তিক তরঙ্গ বরাদ্দের অনুপাত ও ব্যান্ডের বিবরণ</h3>
            <p className="metadata">Detailed breakdown by low-band, mid-band and high-capacity TDD spectrum</p>
          </div>
          <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Stacked Band Breakdown for each operator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          {spectrum.operators.map((op) => {
            return (
              <div key={op.operator}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <strong>
                    {op.operator_bn} ({op.operator})
                  </strong>
                  <span>
                    <strong>{op.total_mhz} MHz</strong> ({op.share_pct}%)
                  </span>
                </div>
                <div style={{ height: '14px', borderRadius: '7px', overflow: 'hidden', display: 'flex', background: 'var(--subtle)' }}>
                  {op.band_700mhz > 0 && <div title={`700 MHz: ${op.band_700mhz} MHz`} style={{ width: `${(op.band_700mhz / 120) * 100}%`, background: '#3182ce' }} />}
                  {op.band_900mhz > 0 && <div title={`900 MHz: ${op.band_900mhz} MHz`} style={{ width: `${(op.band_900mhz / 120) * 100}%`, background: '#38a169' }} />}
                  {op.band_1800mhz > 0 && <div title={`1800 MHz: ${op.band_1800mhz} MHz`} style={{ width: `${(op.band_1800mhz / 120) * 100}%`, background: '#dd6b20' }} />}
                  {op.band_2100mhz > 0 && <div title={`2100 MHz: ${op.band_2100mhz} MHz`} style={{ width: `${(op.band_2100mhz / 120) * 100}%`, background: '#805ad5' }} />}
                  {op.band_2_3ghz > 0 && <div title={`2.3 GHz: ${op.band_2_3ghz} MHz`} style={{ width: `${(op.band_2_3ghz / 120) * 100}%`, background: '#d69e2e' }} />}
                  {op.band_2_6ghz > 0 && <div title={`2.6 GHz: ${op.band_2_6ghz} MHz`} style={{ width: `${(op.band_2_6ghz / 120) * 100}%`, background: '#e53e3e' }} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '18px', fontSize: '11px', color: 'var(--muted-foreground)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '10px', height: '10px', background: '#3182ce', borderRadius: '2px' }} /> 700 MHz</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '10px', height: '10px', background: '#38a169', borderRadius: '2px' }} /> 900 MHz</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '10px', height: '10px', background: '#dd6b20', borderRadius: '2px' }} /> 1800 MHz</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '10px', height: '10px', background: '#805ad5', borderRadius: '2px' }} /> 2100 MHz</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '10px', height: '10px', background: '#d69e2e', borderRadius: '2px' }} /> 2.3 GHz</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i style={{ width: '10px', height: '10px', background: '#e53e3e', borderRadius: '2px' }} /> 2.6 GHz</span>
        </div>

        {/* Recharts Spectrum Comparison Bar Chart */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0' }}>Operator Spectrum Holding Comparison (MHz)</h4>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer minWidth={100} minHeight={220}>
              <BarChart
                data={spectrum.operators.map((op) => ({
                  name: op.operator,
                  '700MHz': op.band_700mhz,
                  '900MHz': op.band_900mhz,
                  '1800MHz': op.band_1800mhz,
                  '2100MHz': op.band_2100mhz,
                  '2.3GHz': op.band_2_3ghz,
                  '2.6GHz': op.band_2_6ghz,
                }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} unit=" MHz" width={55} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="700MHz" fill="#3182ce" stackId="a" />
                <Bar dataKey="900MHz" fill="#38a169" stackId="a" />
                <Bar dataKey="1800MHz" fill="#dd6b20" stackId="a" />
                <Bar dataKey="2100MHz" fill="#805ad5" stackId="a" />
                <Bar dataKey="2.3GHz" fill="#d69e2e" stackId="a" />
                <Bar dataKey="2.6GHz" fill="#e53e3e" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Spectrum Table & Official Gazette Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        <section className="panel data-panel" style={{ padding: '20px' }}>
          <div className="section-top" style={{ marginBottom: '14px' }}>
            <h3>বরাদ্দকৃত অ্যাকসেস তরঙ্গের অফিসিয়াল টেবিল</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>অপারেটর</TableHead>
                  <TableHead>৭০০ মে.হা.</TableHead>
                  <TableHead>৯০০ মে.হা.</TableHead>
                  <TableHead>১৮০০ মে.হা.</TableHead>
                  <TableHead>২১০০ মে.হা.</TableHead>
                  <TableHead>২.৩ গি.হা.</TableHead>
                  <TableHead>২.৬ গি.হা.</TableHead>
                  <TableHead>মোট</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spectrum.operators.map((op) => (
                  <TableRow key={op.operator}>
                    <TableCell style={{ fontWeight: 600 }}>{op.operator_bn}</TableCell>
                    <TableCell>{op.band_700mhz.toFixed(1)}</TableCell>
                    <TableCell>{op.band_900mhz.toFixed(1)}</TableCell>
                    <TableCell>{op.band_1800mhz.toFixed(1)}</TableCell>
                    <TableCell>{op.band_2100mhz.toFixed(1)}</TableCell>
                    <TableCell>{op.band_2_3ghz.toFixed(1)}</TableCell>
                    <TableCell>{op.band_2_6ghz.toFixed(1)}</TableCell>
                    <TableCell><strong style={{ color: 'var(--primary)' }}>{op.total_mhz.toFixed(1)}</strong></TableCell>
                  </TableRow>
                ))}
                <TableRow style={{ background: 'var(--subtle)', fontWeight: 700 }}>
                  <TableCell>সর্বমোট (Total)</TableCell>
                  <TableCell>{spectrum.band_totals.band_700mhz.toFixed(1)}</TableCell>
                  <TableCell>{spectrum.band_totals.band_900mhz.toFixed(1)}</TableCell>
                  <TableCell>{spectrum.band_totals.band_1800mhz.toFixed(1)}</TableCell>
                  <TableCell>{spectrum.band_totals.band_2100mhz.toFixed(1)}</TableCell>
                  <TableCell>{spectrum.band_totals.band_2_3ghz.toFixed(1)}</TableCell>
                  <TableCell>{spectrum.band_totals.band_2_6ghz.toFixed(1)}</TableCell>
                  <TableCell style={{ color: 'var(--primary)', fontSize: '14px' }}>{spectrum.band_totals.total_mhz.toFixed(1)} MHz</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="panel data-panel" style={{ padding: '20px' }}>
          <div className="section-top" style={{ marginBottom: '14px' }}>
            <h3>BTRC Official Gazette Chart</h3>
          </div>
          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img
              src="/data/btrc_spectrum_allocated.png"
              alt="BTRC Official Spectrum Chart"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '8px' }}>
            Official gazette graphic published on BTRC portal
          </small>
        </section>
      </div>
    </div>
  );
}

// =========================================================================
// 9. OPTICAL FIBER NETWORK COMPONENT
// =========================================================================
function OpticalFiberSection({ downloadCSV, downloadJSON }: any) {
  const fiber = BTRC_OPTICAL_FIBER;

  const handleExportCSV = () => {
    const headers = ['Category', 'Total (km)', 'Overhead (km)', 'Underground (km)', 'Percentage of Total (%)'];
    const rows = [
      ['Government (সরকারি)', fiber.government.total_km, fiber.government.overhead_km, fiber.government.underground_km, fiber.government.pct_of_total],
      ['Private NTTN (বেসরকারি)', fiber.private.total_km, fiber.private.overhead_km, fiber.private.underground_km, fiber.private.pct_of_total],
      ['National Total (সর্বমোট)', fiber.total_km, fiber.government.overhead_km + fiber.private.overhead_km, fiber.government.underground_km + fiber.private.underground_km, 100],
    ];
    downloadCSV(headers, rows, 'btrc_optical_fiber_statistics');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Fiber Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            সর্বমোট অপটিক্যাল ফাইবার (National Fiber)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: 'var(--primary)' }}>
            {fiber.total_km.toLocaleString()} কি.মি.
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Across all 64 districts & 495 upazilas
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            সরকারি অপটিক্যাল ফাইবার (Government)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#6ccaff' }}>
            {fiber.government.total_km.toLocaleString()} কি.মি.
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            {fiber.government.pct_of_total}% · আন্ডার গ্রাউন্ড: {fiber.government.underground_km.toLocaleString()} কি.মি.
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            বেসরকারি অপটিক্যাল ফাইবার (Private NTTN)
          </small>
          <div style={{ fontSize: '28px', fontWeight: 650, color: '#f5ba67' }}>
            {fiber.private.total_km.toLocaleString()} কি.মি.
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            {fiber.private.pct_of_total}% · ওভারহেড: {fiber.private.overhead_km.toLocaleString()} কি.মি.
          </small>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <section className="panel data-panel" style={{ padding: '20px' }}>
          <div className="section-top" style={{ marginBottom: '14px' }}>
            <h3>সরকারি অপটিক্যাল ফাইবার নেটওয়ার্ক</h3>
            <span style={{ fontSize: '11px', color: '#6ccaff', fontWeight: 600 }}>৭৯,০৮৩ কি.মি. (৪৩.৯৯%)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>আন্ডার গ্রাউন্ড (Underground Cable)</span>
                <strong>{fiber.government.underground_km.toLocaleString()} কি.মি. (৮৪.৭%)</strong>
              </div>
              <Progress value={84.7} style={{ height: '8px', marginTop: '4px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>ওভারহেড (Overhead Cable)</span>
                <strong>{fiber.government.overhead_km.toLocaleString()} কি.মি. (১৫.৩%)</strong>
              </div>
              <Progress value={15.3} style={{ height: '8px', marginTop: '4px' }} />
            </div>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>মূল প্রকল্প ও উদ্যোগ:</strong>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: '1.7' }}>
                {fiber.government.initiatives.map((init, i) => (
                  <li key={i}>{init}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="panel data-panel" style={{ padding: '20px' }}>
          <div className="section-top" style={{ marginBottom: '14px' }}>
            <h3>বেসরকারি অপটিক্যাল ফাইবার নেটওয়ার্ক (NTTN)</h3>
            <span style={{ fontSize: '11px', color: '#f5ba67', fontWeight: 600 }}>১,০০,৬৯২ কি.মি. (৫৬.০১%)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>ওভারহেড (Overhead Cable)</span>
                <strong>{fiber.private.overhead_km.toLocaleString()} কি.মি. (৬৭.০%)</strong>
              </div>
              <Progress value={67.0} style={{ height: '8px', marginTop: '4px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>আন্ডার গ্রাউন্ড (Underground Cable)</span>
                <strong>{fiber.private.underground_km.toLocaleString()} কি.মি. (৩৩.০%)</strong>
              </div>
              <Progress value={33.0} style={{ height: '8px', marginTop: '4px' }} />
            </div>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>প্রধান লাইসেন্সপ্রাপ্ত অপারেটর:</strong>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: '1.7' }}>
                {fiber.private.key_nttns.map((nttn, i) => (
                  <li key={i}>{nttn}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Submarine Cable Infrastructure */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div className="section-top" style={{ marginBottom: '14px' }}>
          <div>
            <h3>আন্তর্জাতিক সাবমেরিন ক্যাবল ও ল্যান্ডিং স্টেশন</h3>
            <p className="metadata">Bangladesh Submarine Cable Company Limited (BSCPLC)</p>
          </div>
          <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submarine Cable Name</TableHead>
                <TableHead>Landing Station Location</TableHead>
                <TableHead>Operational Timeline</TableHead>
                <TableHead>Allocated Bandwidth Capacity</TableHead>
                <TableHead>Operational Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fiber.submarine_cables.map((c) => (
                <TableRow key={c.name}>
                  <TableCell style={{ fontWeight: 600 }}>{c.name}</TableCell>
                  <TableCell>{c.landing_station}</TableCell>
                  <TableCell>{c.operational_since ? `Active since ${c.operational_since}` : `Target: ${c.target}`}</TableCell>
                  <TableCell><strong style={{ color: 'var(--primary)' }}>{c.capacity}</strong></TableCell>
                  <TableCell>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: c.status === 'Active' ? '#48a98922' : '#f5ba6722', color: c.status === 'Active' ? '#48a989' : '#f5ba67' }}>
                      {c.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 10. ILLEGAL VOIP & SERVICE TERMINATION COMPONENT
// =========================================================================
function VoipSection({ downloadCSV, downloadJSON }: any) {
  const voip = BTRC_VOIP;

  const handleExportCSV = () => {
    const headers = ['Division', 'Raids Conducted', 'SIMs Deactivated', 'Gateways Seized', 'Status'];
    const rows = voip.current_year_enforcements.map((e) => [e.division, e.raids, e.sims_deactivated, e.gateway_seized, e.status]);
    downloadCSV(headers, rows, 'btrc_anti_voip_enforcements');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Enforcement Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            অবৈধ সিম সংযোগ বন্ধকরণ (Blocked SIMs)
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#e53e3e' }}>
            {(voip.total_illegal_sims_blocked / 1000000).toFixed(2)}M
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Deactivated for illegal bypass & fake registration
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            সফল যৌথ অভিযান (Anti-VoIP Raids)
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: 'var(--primary)' }}>
            {voip.total_illegal_voip_raids}
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Conducted jointly with RAB, Police, and BTRC
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            জব্দকৃত সিমবক্স ও গেটওয়ে
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#f5ba67' }}>
            {(voip.equipment_seized.sim_boxes + voip.equipment_seized.voip_gateways).toLocaleString()} Units
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            SIM Boxes: {voip.equipment_seized.sim_boxes} · Gateways: {voip.equipment_seized.voip_gateways}
          </small>
        </div>
        <div className="panel" style={{ padding: '16px' }}>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
            সংরক্ষিত রাজস্ব (Revenue Protected)
          </small>
          <div style={{ fontSize: '26px', fontWeight: 650, color: '#68d391' }}>
            ৳{voip.revenue_loss_prevented_bdt_crore} কোটি
          </div>
          <small style={{ color: 'var(--muted-foreground)', display: 'block', marginTop: '4px' }}>
            Government international termination revenue
          </small>
        </div>
      </div>

      {/* Division-wise Enforcement Tracking */}
      <section className="panel data-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3>বিভাগভিত্তিক অবৈধ ভিওআইপি অভিযান ও সরঞ্জাম জব্দের তালিকা</h3>
            <p className="metadata">Enforcement actions across all 8 divisions</p>
          </div>
          <button className="quiet-button" onClick={handleExportCSV} style={{ border: '1px solid var(--border)', borderRadius: '6px', fontSize: '11px' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>বিভাগ (Division)</TableHead>
                <TableHead>অভিযান সংখ্যা (Raids)</TableHead>
                <TableHead>বন্ধকৃত অবৈধ সিম (SIMs Deactivated)</TableHead>
                <TableHead>জব্দকৃত ভিওআইপি গেটওয়ে</TableHead>
                <TableHead>এনফোর্সমেন্ট স্ট্যাটাস</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voip.current_year_enforcements.map((e) => (
                <TableRow key={e.division}>
                  <TableCell style={{ fontWeight: 600 }}>{e.division}</TableCell>
                  <TableCell>{e.raids}</TableCell>
                  <TableCell><span style={{ color: '#e53e3e', fontWeight: 600 }}>{e.sims_deactivated.toLocaleString()}</span></TableCell>
                  <TableCell>{e.gateway_seized}</TableCell>
                  <TableCell>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: e.status === 'Active Surveillance' ? '#e53e3e22' : '#48a98922', color: e.status === 'Active Surveillance' ? '#e53e3e' : '#48a989' }}>
                      {e.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
