"""
HDFS Verification and Monitoring Script
Checks HDFS status and displays data insights
"""
import subprocess
import json
import os
from dotenv import load_dotenv
from pyspark.sql import SparkSession

load_dotenv()

HDFS_HOST = os.getenv("HDFS_HOST", "localhost")
HDFS_PORT = os.getenv("HDFS_PORT", "9000")
HDFS_BASE_PATH = f"hdfs://{HDFS_HOST}:{HDFS_PORT}/traffic"

print("=" * 100)
print("HDFS VERIFICATION AND MONITORING TOOL")
print("=" * 100)
print(f"\nHDFS Address: {HDFS_HOST}:{HDFS_PORT}")

def check_hdfs_connectivity():
    """Check if HDFS is running and accessible"""
    print("\n" + "=" * 100)
    print("1. HDFS Connectivity Check")
    print("=" * 100)
    try:
        spark = (
            SparkSession.builder
            .appName("HDFSVerification")
            .config("spark.hadoop.fs.defaultFS", f"hdfs://{HDFS_HOST}:{HDFS_PORT}")
            .getOrCreate()
        )
        
        # Try to list HDFS root
        sc = spark.sparkContext
        fs = sc._jvm.org.apache.hadoop.fs.FileSystem.get(
            sc._jvm.org.apache.hadoop.fs.Path(f"hdfs://{HDFS_HOST}:{HDFS_PORT}/").toUri(),
            sc._jvm.org.apache.hadoop.conf.Configuration()
        )
        
        status = fs.getStatus()
        print("✓ HDFS is running and accessible!")
        print(f"  Status: Healthy")
        
        spark.stop()
        return True
    except Exception as e:
        print(f"❌ HDFS Connection Failed: {str(e)}")
        print("\nTroubleshooting Steps:")
        print("1. Check if HDFS is running:")
        print("   - Windows: hdfs namenode (in separate terminal)")
        print("   - Or start HDFS services: start-dfs.cmd (Windows)")
        print("2. Check firewall settings on port 9000")
        print("3. Review HDFS logs for errors")
        return False

def check_hdfs_storage():
    """Check HDFS storage usage and structure"""
    print("\n" + "=" * 100)
    print("2. HDFS Storage and Structure Check")
    print("=" * 100)
    
    try:
        spark = (
            SparkSession.builder
            .appName("StorageCheck")
            .config("spark.hadoop.fs.defaultFS", f"hdfs://{HDFS_HOST}:{HDFS_PORT}")
            .getOrCreate()
        )
        
        # Check if directories exist
        directories = [
            "/traffic",
            "/traffic/data",
            "/traffic/analytics"
        ]
        
        for dir_path in directories:
            try:
                df = spark.read.parquet(f"hdfs://{HDFS_HOST}:{HDFS_PORT}{dir_path}")
                print(f"✓ {dir_path} exists and is readable")
            except:
                print(f"⚠ {dir_path} - Not found or not yet populated")
        
        # Try to read data if it exists
        try:
            df = spark.read.parquet(f"{HDFS_BASE_PATH}/data")
            row_count = df.count()
            print(f"\n✓ Data found in HDFS:")
            print(f"  Total Rows: {row_count:,}")
            print(f"  Partitions: {df.rdd.getNumPartitions()}")
            
            # Estimate size
            size_gb = (row_count * 120) / (1024 ** 3)  # Rough estimate
            print(f"  Estimated Size: ~{size_gb:.2f} GB")
            
        except Exception as e:
            print(f"\n⚠ No data found in HDFS yet")
            print("  Run: python spark/generate_big_traffic_data_hdfs.py")
        
        spark.stop()
        
    except Exception as e:
        print(f"❌ Storage Check Failed: {str(e)}")

def list_hdfs_files():
    """List files in HDFS directories"""
    print("\n" + "=" * 100)
    print("3. HDFS File Structure")
    print("=" * 100)
    
    try:
        spark = (
            SparkSession.builder
            .appName("FileList")
            .config("spark.hadoop.fs.defaultFS", f"hdfs://{HDFS_HOST}:{HDFS_PORT}")
            .getOrCreate()
        )
        
        sc = spark.sparkContext
        fs = sc._jvm.org.apache.hadoop.fs.FileSystem.get(
            sc._jvm.org.apache.hadoop.fs.Path(f"hdfs://{HDFS_HOST}:{HDFS_PORT}/traffic").toUri(),
            sc._jvm.org.apache.hadoop.conf.Configuration()
        )
        
        path = sc._jvm.org.apache.hadoop.fs.Path("/traffic")
        
        if fs.exists(path):
            statuses = fs.listStatus(path)
            print("\nTop-level contents of /traffic:")
            for status in statuses:
                name = status.getPath().getName()
                if status.isDirectory():
                    print(f"  📁 {name}/")
                else:
                    print(f"  📄 {name}")
        else:
            print("⚠ /traffic directory not found in HDFS")
            print("  Create it with: hdfs dfs -mkdir -p /traffic/data")
        
        spark.stop()
        
    except Exception as e:
        print(f"❌ File List Failed: {str(e)}")

def check_data_quality():
    """Check data quality metrics"""
    print("\n" + "=" * 100)
    print("4. Data Quality Check")
    print("=" * 100)
    
    try:
        spark = (
            SparkSession.builder
            .appName("QualityCheck")
            .config("spark.hadoop.fs.defaultFS", f"hdfs://{HDFS_HOST}:{HDFS_PORT}")
            .getOrCreate()
        )
        
        df = spark.read.parquet(f"{HDFS_BASE_PATH}/data")
        
        print("✓ Data Quality Metrics:")
        print(f"  Total Records: {df.count():,}")
        print(f"  Columns: {len(df.columns)}")
        print(f"  Null Values Check:")
        
        null_counts = df.select([(col.isNull().cast("int").alias(col)) for col in df.columns]).toPandas().sum()
        for col_name, null_count in null_counts.items():
            if null_count > 0:
                print(f"    - {col_name}: {null_count} nulls")
        
        print("\n✓ Data Samples:")
        df.limit(3).show(truncate=False)
        
        spark.stop()
        
    except Exception as e:
        print(f"⚠ Data Quality Check - No data yet: {str(e)}")

def show_next_steps():
    """Show next steps for user"""
    print("\n" + "=" * 100)
    print("NEXT STEPS")
    print("=" * 100)
    
    print("\n1. Generate Data (if not already done):")
    print("   python spark/generate_big_traffic_data_hdfs.py")
    
    print("\n2. Run Analytics:")
    print("   python spark/traffic_analytics_hdfs.py")
    
    print("\n3. Monitor HDFS:")
    print("   Web UI: http://localhost:9870")
    print("   Command: hdfs dfs -du -s -h /traffic/")
    
    print("\n4. Useful HDFS Commands:")
    print("   hdfs dfs -ls -h /traffic/              # List files with sizes")
    print("   hdfs dfs -du -s -h /traffic/data       # Check data directory size")
    print("   hdfs dfsadmin -report                  # Overall HDFS health")
    print("   hdfs dfsadmin -report -live            # Live nodes status")

if __name__ == "__main__":
    try:
        check_hdfs_connectivity()
        check_hdfs_storage()
        list_hdfs_files()
        check_data_quality()
        show_next_steps()
        
        print("\n" + "=" * 100)
        print("✓ HDFS VERIFICATION COMPLETE")
        print("=" * 100)
        
    except KeyboardInterrupt:
        print("\n\n⚠ Verification interrupted by user")
    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
