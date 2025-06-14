import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  User,
  Mail,
  MessageSquare,
  Hash,
  Filter,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/theme-toggle";

interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

type SortKey = "postId" | "name" | "email";
type SortOrder = "asc" | "desc" | "none";

const Dashboard = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocalStorage, setLoadingLocalStorage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://jsonplaceholder.typicode.com/comments");
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
        

        const savedSearch = localStorage.getItem("search");
        const savedPage = localStorage.getItem("page");
        const savedPageSize = localStorage.getItem("pageSize");
        const savedSortKey = localStorage.getItem("sortKey") as SortKey | null;
        const savedSortOrder = localStorage.getItem("sortOrder") as SortOrder;

        if (savedSearch) setSearch(savedSearch);
        if (savedPage) setPage(Number(savedPage));
        if (savedPageSize) setPageSize(Number(savedPageSize));
        if (savedSortKey) setSortKey(savedSortKey);
        if (savedSortOrder) setSortOrder(savedSortOrder);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingLocalStorage(false);
      }
    };
    
    fetchData();
  }, []);


  useEffect(() => {
    if (!loadingLocalStorage) {
      localStorage.setItem("search", search);
      localStorage.setItem("page", String(page));
      localStorage.setItem("pageSize", String(pageSize));
      localStorage.setItem("sortKey", sortKey || "");
      localStorage.setItem("sortOrder", sortOrder);
    }
  }, [search, page, pageSize, sortKey, sortOrder, loadingLocalStorage]);

  
  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return comments.filter((c) =>
      [c.name, c.email, c.body].some((field) =>
        field.toLowerCase().includes(query)
      )
    );
  }, [comments, search]);

  
  const sorted = useMemo(() => {
    if (!sortKey || sortOrder === "none") return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] as string | number;
      const bVal = b[sortKey] as string | number;

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortOrder]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
    } else {
      if (sortOrder === "none") setSortOrder("asc");
      else if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortOrder("none");
        setSortKey(null);
      }
    }
    setPage(1);
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    if (sortOrder === "asc") return <ChevronUp className="h-4 w-4" />;
    if (sortOrder === "desc") return <ChevronDown className="h-4 w-4" />;
    return null;
  };

  const handleReset = () => {
    setSearch("");
    setPage(1);
    setPageSize(10);
    setSortKey(null);
    setSortOrder("none");
  };

  if (loading || loadingLocalStorage) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading comments...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-2 p-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">
                Error loading comments
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
             Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore user comments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={() => navigate("/profile")} className="gap-2">
            <User className="h-4 w-4" />
            View Profile
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Comments
                </p>
                <p className="text-2xl font-bold">{comments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Filter className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Filtered Results
                </p>
                <p className="text-2xl font-bold">{filtered.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Hash className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Page
                </p>
                <p className="text-2xl font-bold">
                  {page} of {totalPages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unique Posts
                </p>
                <p className="text-2xl font-bold">
                  {new Set(comments.map((c) => c.postId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Search Comments</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or comment content..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Items per page</label>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} items
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {(search || sortKey) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{search}"
                  <button
                    onClick={() => setSearch("")}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {sortKey && (
                <Badge variant="secondary" className="gap-1">
                  Sort: {sortKey} ({sortOrder})
                  <button
                    onClick={() => {
                      setSortKey(null);
                      setSortOrder("none");
                    }}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({filtered.length})
            </span>
            {filtered.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, filtered.length)} of{" "}
                {filtered.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full">

              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-b font-medium text-sm">
                <div
                  className="col-span-1 cursor-pointer flex items-center gap-2 hover:text-blue-600 transition-colors"
                  onClick={() => handleSort("postId")}
                >
                  <Hash className="h-4 w-4" />
                  Post ID
                  {getSortIcon("postId")}
                </div>
                <div
                  className="col-span-3 cursor-pointer flex items-center gap-2 hover:text-blue-600 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <User className="h-4 w-4" />
                  Name
                  {getSortIcon("name")}
                </div>
                <div
                  className="col-span-3 cursor-pointer flex items-center gap-2 hover:text-blue-600 transition-colors"
                  onClick={() => handleSort("email")}
                >
                  <Mail className="h-4 w-4" />
                  Email
                  {getSortIcon("email")}
                </div>
                <div className="col-span-5 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comment
                </div>
              </div>


              {paginated.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No comments found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {search
                      ? `No comments match your search "${search}"`
                      : "No comments available"}
                  </p>
                  {search && (
                    <Button onClick={() => setSearch("")} variant="outline">
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {paginated.map((comment, index) => (
                    <div
                      key={comment.id}
                      className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50/50 dark:bg-gray-800/20"
                      }`}
                    >
                      <div className="col-span-1">
                        <Badge variant="outline" className="text-xs">
                          #{comment.postId}
                        </Badge>
                      </div>
                      <div className="col-span-3">
                        <p
                          className="font-medium text-sm truncate"
                          title={comment.name}
                        >
                          {comment.name}
                        </p>
                      </div>
                      <div className="col-span-3">
                        <a
                          href={`mailto:${comment.email}`}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block transition-colors"
                          title={comment.email}
                        >
                          {comment.email}
                        </a>
                      </div>
                      <div className="col-span-5">
                        <p
                          className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                          title={comment.body}
                        >
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, filtered.length)} of{" "}
                {filtered.length} results
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;