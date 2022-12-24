const {CSVPrinter, CSVFormat} = Packages.org.apache.commons.csv;

function create_csv_file() {
    let printer = new CSVPrinter(new java.io.FileWriter("csv.txt"), CSVFormat.EXCEL)
    printer.printRecord("id", "userName", "firstName", "lastName");
    printer.printRecord(1, "john73", "John", "Doe");
    printer.println();
    printer.printRecord(2, "mary", "Mary", "Meyer");
    printer.close();
}
create_csv_file();