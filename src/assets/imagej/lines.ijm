filelist = getArgument();
file = split(filelist,'#');

open(file[0]);
run("8-bit");
run("Ridge Detection", "line_width=3.5 high_contrast=230 low_contrast=87 correct_position extend_line show_ids displayresults add_to_manager method_for_overlap_resolution=NONE sigma=1.51 lower_threshold=3.06 upper_threshold=7.99 minimum_line_length=5 maximum=0");
saveAs("Results", file[1]);
