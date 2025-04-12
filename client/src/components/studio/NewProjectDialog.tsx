import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Project name is required").max(50, "Project name must be less than 50 characters"),
});

export default function NewProjectDialog({ open, onOpenChange, onSuccess }: NewProjectDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsCreating(true);
      
      // For demo purposes, we're using userId 1
      const response = await apiRequest("POST", "/api/projects", {
        name: values.name,
        userId: 1
      });
      
      const project = await response.json();
      
      // Invalidate projects query to refresh the projects list
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      toast({
        title: "Project created",
        description: `"${values.name}" has been created successfully.`,
      });
      
      // Reset form
      form.reset();
      
      // Close dialog
      onOpenChange(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Navigate to the studio with the new project
      setLocation(`/studio?project=${project.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-800 border-neutral-700 text-neutral-50 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Create New Project</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Give your musical creation a name to get started.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Summer Vibes" 
                      className="bg-neutral-700 border-neutral-600 focus:border-primary text-neutral-100"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-neutral-600"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
