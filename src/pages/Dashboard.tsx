import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaEnvelope, FaFilePdf, FaPlus, FaShareAlt, FaCopy, FaExternalLinkAlt,  } from 'react-icons/fa';
import { MdDeleteForever } from "react-icons/md";
import './styles/Dashboard.css';

interface Report {
    id: number;
    title: string;
    category: string;
    content: string;
    createdAt: string;
    author: string;
    pdfUrl: string;
}

const Dashboard: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('全て');
    const [categories] = useState<string[]>(['全て', 'テスト1', 'テスト2', 'テスト3']);
    const [showModal, setShowModal] = useState(false);
    const [currentReport, setCurrentReport] = useState<Report | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [currentReportId, setCurrentReportId] = useState<number | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get<Report[]>('http://localhost:3000/api/reports', { withCredentials: true });
            setReports(response.data);
        } catch (error) {
            console.error('レポートの取得に失敗しました:', error);
        }
    };

    const handleCreateReport = () => {
        setCurrentReport(null);
        setShowModal(true);
    };

    const handleEditReport = (report: Report) => {
        setCurrentReport(report);
        setShowModal(true);
    };

    const handleShareReport = async (reportId: number) => {
        try {
            const response = await axios.post(`http://localhost:3000/api/reports/${reportId}/share`, {}, { withCredentials: true });
            setShareLink(response.data.shareLink);
            setCurrentReportId(reportId);
            setShowShareModal(true);
        } catch (error) {
            console.error('共有に失敗しました:', error);
            alert('レポートの共有に失敗しました。');
        }
    };

    const handleGeneratePDF = async (reportId: number) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/reports/${reportId}/generate-pdf`, {
                withCredentials: true
            });
            const url = response.data.pdfUrl;
            setPdfUrl(url);
            setCurrentReportId(reportId);
            setShowPdfModal(true);
        } catch (error) {
            console.error('PDFの生成に失敗しました:', error);
            alert('PDFの生成に失敗しました。');
        }
    };

    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm('本当に削除しますか？')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/api/reports/${reportId}`, { withCredentials: true });
            await fetchReports();
        } catch (error) {
            console.error('レポートの削除に失敗しました:', error);
            alert('レポートの削除に失敗しました。');
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const reportData = Object.fromEntries(formData.entries());

        try {
            if (currentReport) {
                await axios.put(`http://localhost:3000/api/reports/${currentReport.id}`, reportData, { withCredentials: true });
            } else {
                await axios.post('http://localhost:3000/api/reports', reportData, { withCredentials: true });
            }
            setShowModal(false);
            await fetchReports();
        } catch (error) {
            console.error('レポートの送信に失敗しました:', error);
            alert('レポートの送信に失敗しました。もう一度お試しください。');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            alert('リンクがクリップボードにコピーされました。');
        });
    };

    const handleSendEmail = () => {
        const subject = encodeURIComponent(`レポート共有`);
        const body = encodeURIComponent(`レポートが共有されました。以下のリンクからアクセスできます：\n\n${shareLink}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleOpenInNewTab = () => {
        window.open(shareLink, '_blank');
    };

    const filteredReports = selectedCategory === '全て'
        ? reports
        : reports.filter(report => report.category === selectedCategory);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">レポートダッシュボード</h1>
                <div className="dashboard-actions">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <button className="create-report-btn" onClick={handleCreateReport}>
                        <FaPlus /> 新規レポート作成
                    </button>
                </div>
            </div>

            <ul className="report-list">
                {filteredReports.map(report => (
                    <li key={report.id} className="report-item">
                        <div className="report-preview">
                            <img src={report.pdfUrl} alt={report.title} className="report-image" />
                        </div>
                        <div className="report-info">
                            <h2 className="report-title">{report.title}</h2>
                            <p className="report-author">作成者: {report.author}</p>
                            <p className="report-category">カテゴリ: {report.category}</p>
                        </div>
                        <div className="report-actions">
                            <button className="action-btn edit-btn" onClick={() => handleEditReport(report)}>
                                <FaEdit /> 編集
                            </button>
                            <button className="action-btn share-btn" onClick={() => handleShareReport(report.id)}>
                                <FaShareAlt /> 共有
                            </button>
                            <button className="action-btn pdf-btn" onClick={() => handleGeneratePDF(report.id)}>
                                <FaFilePdf /> PDF
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteReport(report.id)}>
                                <MdDeleteForever /> 削除
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{currentReport ? 'レポート編集' : '新規レポート作成'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">タイトル</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    defaultValue={currentReport?.title}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">カテゴリ</label>
                                <select
                                    id="category"
                                    name="category"
                                    defaultValue={currentReport?.category}
                                    required
                                >
                                    {categories.filter(cat => cat !== '全て').map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="content">内容</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    defaultValue={currentReport?.content}
                                    required
                                ></textarea>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    {currentReport ? '更新' : '作成'}
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    キャンセル
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showShareModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>レポート共有</h2>
                        <p>共有リンク: {shareLink}</p>
                        <div className="modal-actions">
                            <button onClick={handleCopyLink}><FaCopy /> コピー</button>
                            <button onClick={handleSendEmail}><FaEnvelope /> メールで送信</button>
                            <button onClick={handleOpenInNewTab}><FaExternalLinkAlt /> 新しいタブで開く</button>
                        </div>
                        <button onClick={() => setShowShareModal(false)}>閉じる</button>
                    </div>
                </div>
            )}

            {showPdfModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>PDFプレビュー</h2>
                        <iframe src={pdfUrl} width="100%" height="500px"
                                title={`PDF Preview for Report ${currentReportId}`}/>
                        <div className="modal-actions">
                            <button onClick={() => window.open(pdfUrl, '_blank')}><FaExternalLinkAlt/> 新しいタブで開く
                            </button>
                            <a href={pdfUrl} download={`report_${currentReportId}.pdf`}><FaFilePdf/> ダウンロード</a>
                        </div>
                        <button onClick={() => setShowPdfModal(false)}>閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
