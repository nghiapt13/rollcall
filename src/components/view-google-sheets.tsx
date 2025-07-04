'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ExternalLink, Table, RefreshCw } from 'lucide-react';

export function ViewGoogleSheets() {
    const [isOpen, setIsOpen] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2PDr-5t__PkBsaZouAuzXJXMyb7GCdWj1DtSmuTpXzg36doRTnQfvtNR2pjBXI2OpQbZF9Qns3fKF/pubhtml?widget=true&amp;headers=false";
    const directSheetUrl = "https://docs.google.com/spreadsheets/d/1T-Cw1pHl2cNbJGDUhdRpKfBNqZNje8Je2RcXrTpHQMI/edit?usp=sharing";

    const handleReload = () => {
        setReloadKey(prev => prev + 1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                >
                    <Table className="w-4 h-4" />
                    Xem dữ liệu chấm công
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[99vw] max-w-[1800px] h-[90vh] max-h-[90vh] overflow-hidden p-4 sm:max-w-[1920px]">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center text-base">
                        <div className="flex items-center gap-2">
                            <Table className="w-5 h-5 text-green-600" />
                            Dữ liệu chấm công - FPI DN
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReload}
                                className="flex items-center gap-1 text-orange-600 hover:text-orange-800"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Tải lại
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(directSheetUrl, '_blank')}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Mở trong tab mới
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 border rounded-lg overflow-hidden" style={{ height: 'calc(90vh - 120px)' }}>
                    <iframe
                        key={reloadKey}
                        src={sheetUrl}
                        className="w-full h-full border-0"
                        title="Google Sheets - Dữ liệu chấm công"
                        loading="lazy"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}