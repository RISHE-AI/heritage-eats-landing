import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { fetchNotes, createNote, updateNote, deleteNote } from '@/services/api';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface Note {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function AdminNotes({ password, onLogout }: { password?: string, onLogout?: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentNote, setCurrentNote] = useState<{ id?: string, title: string, content: string, category: string }>({
    title: '',
    content: '',
    category: 'General'
  });

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await fetchNotes();
      if (res.success) {
        setNotes(res.data);
      }
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleOpenDialog = (note?: Note) => {
    if (note) {
      setCurrentNote({ id: note._id, title: note.title, content: note.content, category: note.category || 'General' });
    } else {
      setCurrentNote({ title: '', content: '', category: 'General' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentNote.title.trim() || !currentNote.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (currentNote.id) {
        await updateNote(currentNote.id, {
          title: currentNote.title,
          content: currentNote.content,
          category: currentNote.category
        });
        toast.success("Note updated successfully");
      } else {
        await createNote({
          title: currentNote.title,
          content: currentNote.content,
          category: currentNote.category
        });
        toast.success("Note created successfully");
      }
      setIsDialogOpen(false);
      loadNotes();
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(id);
      toast.success("Note deleted");
      loadNotes();
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Notes/Drafts</h2>
          <p className="text-muted-foreground">Jot down recipes, marketing ideas, URLs, and task lists.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add New Note
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notes.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <StickyNote className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">No notes created yet</p>
            <p className="text-sm">Click the button above to start capturing ideas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max p-2 sm:p-4">
          {notes.map((note, index) => {
            const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0'];
            const rotClass = rotations[index % 5];
            
            return (
            <Card key={note._id} className={cn(
              "relative flex flex-col overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl hover:rotate-0 hover:z-10 group",
              "bg-gradient-to-br from-[#FEFCE8] to-[#FEF08A] dark:from-yellow-800 dark:to-yellow-900/80",
              "text-yellow-950 dark:text-yellow-50",
              "border-0 shadow-md min-h-[220px]",
              rotClass
            )}>
              {/* Pin graphic */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-400 dark:bg-red-500 shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-10 
              after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:bg-white/60 after:rounded-full"></div>
              
              {/* Folded corner effect */}
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[24px] border-l-[24px] border-b-transparent border-l-yellow-300 dark:border-l-yellow-950 shadow-[-2px_-2px_4px_rgba(0,0,0,0.05)]"></div>

              <CardHeader className="pb-2 pt-7 relative z-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <CardTitle className="text-xl font-serif leading-tight drop-shadow-sm line-clamp-2">{note.title}</CardTitle>
                    <CardDescription className="text-xs mt-1 text-yellow-800/70 dark:text-yellow-200/50 font-medium">
                      {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 ml-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity absolute right-2 top-6 bg-yellow-100/80 dark:bg-yellow-800/80 backdrop-blur-sm rounded-lg shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(note)} className="h-7 w-7 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-700">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(note._id)} className="h-7 w-7 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 relative z-0">
                {/* Horizontal lined paper effect background (subtle) */}
                <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10" 
                     style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #eab308 24px)' }}></div>
                
                {/* Render the HTML safely */}
                <div 
                  className={cn(
                    "relative z-10 prose prose-sm max-w-none text-sm leading-relaxed overflow-hidden",
                    "prose-headings:text-yellow-950 dark:prose-headings:text-yellow-50 prose-headings:font-serif",
                    "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-bold",
                    "prose-p:text-yellow-900 dark:prose-p:text-yellow-100",
                    "prose-strong:text-yellow-950 dark:prose-strong:text-yellow-50",
                    "prose-img:rounded-md prose-img:border prose-img:border-yellow-200 dark:prose-img:border-yellow-700",
                    "max-h-[160px] line-clamp-[7]" // Constrain height on grid
                  )} 
                  dangerouslySetInnerHTML={{ __html: note.content }} 
                />
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] h-[90vh] sm:h-auto max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle>{currentNote.id ? 'Edit Note' : 'Create New Note'}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1 min-h-0">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={currentNote.title} 
                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })} 
                placeholder="Marketing Draft, Recipe Notes..." 
              />
            </div>

            <div className="space-y-2 flex flex-col h-[60vh] sm:h-[400px]">
              <Label>Content (Rich Text, Images, Links)</Label>
              <div className="flex-1 bg-background border rounded-md overflow-hidden flex flex-col [&_.quill]:flex-1 [&_.quill]:flex [&_.quill]:flex-col [&_.ql-container]:flex-1 [&_.ql-container]:overflow-hidden [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:h-full">
                <ReactQuill 
                  theme="snow" 
                  value={currentNote.content} 
                  onChange={(val) => setCurrentNote({ ...currentNote, content: val })} 
                  modules={quillModules}
                  className="h-full"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
