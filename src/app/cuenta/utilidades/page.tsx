"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageOptionsDto } from "@/type/general";

/* ===================== NOTES ===================== */
import {
  FindAll as FindNotes,
  Delete as DeleteNote,
  Update as UpdateNote,
  Create as CreateNote,
} from "@/services/note";
import ModalNote from "@/components/noteModal";
import { NoteCollectionInterface } from "@/type/note.interface";

/* ===================== TAXES ===================== */
import {
  FindAll as FindTaxes,
  Delete as DeleteTax,
  Update as UpdateTax,
  Create as CreateTax,
} from "@/services/tax";
import ModalTax from "@/components/taxModal";
import { taxCollectionInterface } from "@/type/tax.interface";

import ModalConfirmDeleteNote from "@/components/confirmDeleteNoteModal";

const PAGE_SIZE = 10;

export default function NotesAndTaxesPage() {
  /* ===================== NOTES STATE ===================== */
  const [notes, setNotes] = useState<NoteCollectionInterface[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesPage, setNotesPage] = useState(1);
  const [notesTotalPages, setNotesTotalPages] = useState(1);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    note: string;
    _id: string;
  } | null>(null);

  /* ===================== TAXES STATE ===================== */
  const [taxes, setTaxes] = useState<taxCollectionInterface[]>([]);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxPage, setTaxPage] = useState(1);
  const [taxTotalPages, setTaxTotalPages] = useState(1);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingTax, setEditingTax] = useState<{
    name: string;
    amount: number;
    _id: string;
  } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"note" | "tax" | null>(null);

  /* ===================== FETCH NOTES ===================== */
  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const pagination: PageOptionsDto = {
        page: notesPage,
        perpage: PAGE_SIZE,
      };
      const res = await FindNotes(pagination);
      setNotes(res.records);
      setNotesTotalPages(res.totalpages);
    } finally {
      setNotesLoading(false);
    }
  }, [notesPage]);

  /* ===================== FETCH TAXES ===================== */
  const fetchTaxes = useCallback(async () => {
    setTaxLoading(true);
    try {
      const pagination: PageOptionsDto = {
        page: taxPage,
        perpage: PAGE_SIZE,
      };
      const res = await FindTaxes(pagination);
      setTaxes(res.records);
      setTaxTotalPages(res.totalpages);
    } finally {
      setTaxLoading(false);
    }
  }, [taxPage]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  /* ===================== DELETE ===================== */
  const handleConfirmDelete = async () => {
    if (deleteType === "note" && deleteId) {
      await DeleteNote(deleteId);
      fetchNotes();
    }

    if (deleteType === "tax" && deleteId) {
      await DeleteTax(deleteId);
      fetchTaxes();
    }

    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteType(null);
  };

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className="text-2xl font-semibold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Configuración
      </motion.h1>

      {/* ===================== GRID ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6">
        {/* ===================== TAXES ===================== */}
        <section className="bg-white border border-gray-300 rounded-xl p-4">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">Impuestos</h2>
            <button
              onClick={() => {
                setEditingTax(null);
                setShowTaxModal(true);
              }}
              className="btn btn-sm btn-primary"
            >
              Nuevo impuesto
            </button>
          </div>

          {/* Tabla desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <tbody>
                {taxLoading ? (
                  <tr>
                    <td className="text-center py-2 text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : (
                  taxes.map((tax, i) => (
                    <motion.tr
                      key={tax._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="border-b border-gray-300 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex justify-between items-center gap-3">
                          <span className="font-medium">
                            {tax.name} - {tax.amount}%
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingTax({
                                  name: tax.name,
                                  amount: tax.amount,
                                  _id: tax._id,
                                });
                                setShowTaxModal(true);
                              }}
                              className="btn btn-xs btn-primary"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setDeleteType("tax");
                                setDeleteId(tax._id);
                                setShowDeleteModal(true);
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-xl cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-4">
            <AnimatePresence>
              {taxes.map((tax) => (
                <motion.div
                  key={tax._id}
                  className="bg-white border rounded-xl p-4 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-semibold">{tax.name}</p>
                  <p className="text-sm text-gray-500">{tax.amount}%</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTax({
                          name: tax.name,
                          amount: tax.amount,
                          _id: tax._id,
                        });
                        setShowTaxModal(true);
                      }}
                      className="btn btn-xs btn-primary"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeleteType("tax");
                        setDeleteId(tax._id);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-xl"
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-6">
            <button
              onClick={() => setTaxPage((p) => Math.max(p - 1, 1))}
              disabled={taxPage === 1}
              className="px-3 py-1 border rounded-xl disabled:opacity-50  cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-sm">
              {taxPage} / {taxTotalPages}
            </span>
            <button
              onClick={() =>
                setTaxPage((p) => Math.min(p + 1, taxTotalPages))
              }
              disabled={taxPage === taxTotalPages}
              className="px-3 py-1 border rounded-xl disabled:opacity-50  cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </section>

        {/* ===================== NOTES ===================== */}
        <section className="bg-white border border-gray-300 rounded-xl p-4">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">Notas</h2>
            <button
              onClick={() => {
                setEditingNote(null);
                setShowNoteModal(true);
              }}
              className="btn btn-sm btn-primary"
            >
              Nueva nota
            </button>
          </div>

          {/* Tabla desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <tbody>
                {notesLoading ? (
                  <tr>
                    <td className="text-center py-2 text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : (
                  notes.map((note, i) => (
                    <motion.tr
                      key={note._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="border-b border-gray-300 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex justify-between items-start gap-4">
                          <span className="font-medium whitespace-pre-line break-words min-w-0 flex-1 text-left">
                            {note.note}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingNote({
                                  note: note.note,
                                  _id: note._id,
                                });
                                setShowNoteModal(true);
                              }}
                              className="btn btn-xs btn-primary"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setDeleteType("note");
                                setDeleteId(note._id);
                                setShowDeleteModal(true);
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-xl cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-4">
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note._id}
                  className="bg-white border rounded-xl p-4 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-semibold whitespace-pre-line break-words">
                    {note.note}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingNote({
                          note: note.note,
                          _id: note._id,
                        });
                        setShowNoteModal(true);
                      }}
                      className="btn btn-xs btn-primary"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeleteType("note");
                        setDeleteId(note._id);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-xl"
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-6">
            <button
              onClick={() => setNotesPage((p) => Math.max(p - 1, 1))}
              disabled={notesPage === 1}
              className="px-3 py-1 border rounded-xl disabled:opacity-50  cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-sm">
              {notesPage} / {notesTotalPages}
            </span>
            <button
              onClick={() =>
                setNotesPage((p) =>
                  Math.min(p + 1, notesTotalPages)
                )
              }
              disabled={notesPage === notesTotalPages}
              className="px-3 py-1 border rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </section>
      </div>

      {/* ===================== MODALS ===================== */}
      <ModalNote
        visible={showNoteModal}
        initialData={editingNote}
        onClose={() => {
          setShowNoteModal(false);
          setEditingNote(null);
        }}
        onSubmit={async (data) => {
          if (editingNote) {
            await UpdateNote(editingNote._id, data.note);
          } else {
            await CreateNote(data.note);
          }
          fetchNotes();
        }}
      />

      <ModalTax
        visible={showTaxModal}
        initialData={editingTax}
        onClose={() => {
          setShowTaxModal(false);
          setEditingTax(null);
        }}
        onSubmit={async (data) => {
          if (editingTax) {
            await UpdateTax(editingTax._id, data);
          } else {
            await CreateTax(data);
          }
          fetchTaxes();
        }}
      />

      <ModalConfirmDeleteNote
        visible={showDeleteModal}
        type={deleteType}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}
